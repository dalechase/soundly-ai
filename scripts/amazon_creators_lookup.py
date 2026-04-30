#!/usr/bin/env python3
import argparse
import base64
import json
import os
import re
import sys
import time
from pathlib import Path
from urllib.parse import urljoin

import requests


TOKEN_CACHE = Path(".cache/amazon-creators-token.json")
DEFAULT_MARKETPLACE = "www.amazon.com"
DEFAULT_PARTNER_TAG = "inet9tv-20"
DEFAULT_API_HOST = "https://creatorsapi.amazon"

TOKEN_ENDPOINTS = {
    "2.1": "https://creatorsapi.auth.us-east-1.amazoncognito.com/oauth2/token",
    "2.2": "https://creatorsapi.auth.eu-south-2.amazoncognito.com/oauth2/token",
    "2.3": "https://creatorsapi.auth.us-west-2.amazoncognito.com/oauth2/token",
    "3.1": "https://api.amazon.com/auth/o2/token",
    "3.2": "https://api.amazon.co.uk/auth/o2/token",
    "3.3": "https://api.amazon.co.jp/auth/o2/token",
}


def load_profile_exports():
    profile = Path.home() / ".profile"
    if not profile.exists():
        return

    export_re = re.compile(r"^\s*export\s+([A-Z0-9_]+)=(.*)\s*$")
    for line in profile.read_text(encoding="utf-8", errors="ignore").splitlines():
        match = export_re.match(line)
        if not match:
            continue
        key, raw_value = match.groups()
        if key in os.environ:
            continue
        value = raw_value.strip().strip('"').strip("'")
        os.environ[key] = value


def env_first(*names, default=None):
    for name in names:
        value = os.environ.get(name)
        if value:
            return value
    return default


def normalize_version(version):
    if not version:
        return None
    return version.strip().lower().removeprefix("v")


def config():
    load_profile_exports()

    credential_id = env_first("AMAZON_CREDENTIAL_ID", "AMAZON_CLIENT_ID")
    credential_secret = env_first("AMAZON_CREDENTIAL_SECRET", "AMAZON_SECRET", "AMAZON_CLIENT_SECRET")
    version = normalize_version(env_first("AMAZON_CREDENTIAL_VERSION", "AMAZON_VERSION"))

    missing = [
        name
        for name, value in {
            "AMAZON_CREDENTIAL_ID": credential_id,
            "AMAZON_SECRET": credential_secret,
            "AMAZON_VERSION": version,
        }.items()
        if not value
    ]
    if missing:
        raise RuntimeError(f"Missing Amazon credential env vars: {', '.join(missing)}")

    return {
        "credential_id": credential_id,
        "credential_secret": credential_secret,
        "version": version,
        "marketplace": env_first("AMAZON_MARKETPLACE", default=DEFAULT_MARKETPLACE),
        "partner_tag": env_first("AMAZON_PARTNER_TAG", "AMAZON_ASSOCIATE_TAG", default=DEFAULT_PARTNER_TAG),
        "api_host": env_first("AMAZON_CREATORS_API_HOST", default=DEFAULT_API_HOST).rstrip("/"),
        "auth_endpoint": env_first("AMAZON_AUTH_ENDPOINT"),
    }


def token_endpoint(cfg):
    endpoint = cfg["auth_endpoint"] or TOKEN_ENDPOINTS.get(cfg["version"])
    if not endpoint:
        supported = ", ".join(sorted(TOKEN_ENDPOINTS.keys()))
        raise RuntimeError(f"Unsupported Amazon credential version {cfg['version']}. Supported: {supported}; or set AMAZON_AUTH_ENDPOINT.")
    return endpoint


def token_scope(version):
    return "creatorsapi::default" if version.startswith("3.") else "creatorsapi/default"


def token_header(version, access_token):
    if version.startswith("3."):
        return f"Bearer {access_token}"
    return f"Bearer {access_token}, Version {version}"


def cache_key(cfg):
    return f"{cfg['credential_id']}:{cfg['version']}:{token_endpoint(cfg)}"


def read_cached_token(cfg):
    if not TOKEN_CACHE.exists():
        return None
    try:
        cached = json.loads(TOKEN_CACHE.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return None
    if cached.get("key") != cache_key(cfg):
        return None
    if time.time() >= cached.get("expires_at", 0):
        return None
    return cached.get("access_token")


def write_cached_token(cfg, access_token, expires_in):
    TOKEN_CACHE.parent.mkdir(parents=True, exist_ok=True)
    TOKEN_CACHE.write_text(
        json.dumps(
            {
                "key": cache_key(cfg),
                "access_token": access_token,
                "expires_at": time.time() + max(30, int(expires_in) - 60),
            }
        ),
        encoding="utf-8",
    )
    try:
        TOKEN_CACHE.chmod(0o600)
    except OSError:
        pass


def request_token(cfg):
    cached = read_cached_token(cfg)
    if cached:
        return cached

    endpoint = token_endpoint(cfg)
    basic = base64.b64encode(f"{cfg['credential_id']}:{cfg['credential_secret']}".encode()).decode()
    base_payload = {
        "grant_type": "client_credentials",
        "scope": token_scope(cfg["version"]),
    }

    attempts = [
        (
            {"Content-Type": "application/x-www-form-urlencoded", "Authorization": f"Basic {basic}"},
            base_payload,
        ),
        (
            {"Content-Type": "application/x-www-form-urlencoded"},
            {
                **base_payload,
                "client_id": cfg["credential_id"],
                "client_secret": cfg["credential_secret"],
            },
        ),
    ]

    last_error = None
    for headers, payload in attempts:
        response = requests.post(endpoint, data=payload, headers=headers, timeout=20)
        if response.ok:
            data = response.json()
            access_token = data.get("access_token")
            if not access_token:
                raise RuntimeError("Amazon auth response did not include access_token")
            write_cached_token(cfg, access_token, data.get("expires_in", 3600))
            return access_token
        last_error = f"Amazon auth failed with HTTP {response.status_code}: {safe_error_text(response.text)}"

    raise RuntimeError(last_error)


def safe_error_text(text):
    text = text or ""
    text = re.sub(r"amzn1\.[A-Za-z0-9._-]+", "[redacted]", text)
    return text[:800]


def maybe_money(price):
    if not isinstance(price, dict):
        return None
    return price.get("displayAmount") or price.get("DisplayAmount")


def normalize_item(item, query):
    item_info = item.get("itemInfo") or item.get("ItemInfo") or {}
    title_data = item_info.get("title") or item_info.get("Title") or {}
    title = title_data.get("displayValue") or title_data.get("DisplayValue") or item.get("title")

    images = item.get("images") or item.get("Images") or {}
    primary = images.get("primary") or images.get("Primary") or {}
    image = None
    for size in ("highRes", "large", "medium", "small", "HighRes", "Large", "Medium", "Small"):
        candidate = primary.get(size)
        if isinstance(candidate, dict) and candidate.get("url"):
            image = candidate.get("url")
            break
        if isinstance(candidate, dict) and candidate.get("URL"):
            image = candidate.get("URL")
            break

    offers = item.get("offersV2") or item.get("OffersV2") or {}
    listings = offers.get("listings") or offers.get("Listings") or []
    first_listing = listings[0] if listings else {}
    price = maybe_money(first_listing.get("price") or first_listing.get("Price"))

    reviews = item.get("customerReviews") or item.get("CustomerReviews") or {}
    rating_data = reviews.get("starRating") or reviews.get("StarRating") or {}
    rating = rating_data.get("value") or rating_data.get("Value")
    review_count = reviews.get("count") or reviews.get("Count")

    asin = item.get("asin") or item.get("ASIN")
    detail_url = item.get("detailPageURL") or item.get("DetailPageURL")

    return {
        "asin": asin,
        "title": title,
        "detailPageUrl": detail_url,
        "image": image,
        "price": price,
        "rating": rating,
        "reviewCount": review_count,
        "amazonScore": item.get("score") or item.get("Score"),
        "matchScore": score_item(title or "", query, rating, review_count),
    }


def score_item(title, query, rating, review_count):
    title_tokens = set(re.findall(r"[a-z0-9]+", title.lower()))
    query_tokens = [token for token in re.findall(r"[a-z0-9]+", query.lower()) if len(token) > 2]
    if not query_tokens:
        return 0

    overlap = sum(1 for token in query_tokens if token in title_tokens)
    score = (overlap / len(query_tokens)) * 70
    try:
        score += min(float(rating or 0), 5) * 4
    except (TypeError, ValueError):
        pass
    try:
        score += min(int(review_count or 0), 1000) / 100
    except (TypeError, ValueError):
        pass
    return round(min(score, 100), 2)


def search_items(args):
    cfg = config()
    access_token = request_token(cfg)
    body = {
        "partnerTag": args.partner_tag or cfg["partner_tag"],
        "keywords": args.query,
        "itemCount": args.item_count,
        "resources": [
            "itemInfo.title",
            "itemInfo.features",
            "itemInfo.byLineInfo",
            "images.primary.medium",
            "images.primary.large",
            "offersV2.listings.price",
            "offersV2.listings.availability",
            "customerReviews.starRating",
            "customerReviews.count",
            "browseNodeInfo.browseNodes",
            "parentASIN",
        ],
    }

    if args.search_index:
        body["searchIndex"] = args.search_index
    if args.min_rating:
        body["minReviewsRating"] = args.min_rating
    if args.min_price:
        body["minPrice"] = args.min_price
    if args.max_price:
        body["maxPrice"] = args.max_price

    headers = {
        "Authorization": token_header(cfg["version"], access_token),
        "Content-Type": "application/json",
        "Accept": "application/json",
        "x-marketplace": args.marketplace or cfg["marketplace"],
    }

    url = urljoin(f"{cfg['api_host']}/", "catalog/v1/searchItems")
    response = requests.post(url, json=body, headers=headers, timeout=30)
    if not response.ok:
        raise RuntimeError(f"Amazon search failed with HTTP {response.status_code}: {safe_error_text(response.text)}")

    payload = response.json()
    search_result = payload.get("searchResult") or payload.get("SearchResult") or {}
    items = search_result.get("items") or search_result.get("Items") or []
    candidates = [normalize_item(item, args.query) for item in items]
    candidates.sort(key=lambda item: item.get("matchScore") or 0, reverse=True)

    return {
        "ok": True,
        "provider": "amazon-creators-api",
        "query": args.query,
        "marketplace": args.marketplace or cfg["marketplace"],
        "partnerTag": args.partner_tag or cfg["partner_tag"],
        "totalResultCount": search_result.get("totalResultCount") or search_result.get("TotalResultCount"),
        "searchUrl": search_result.get("searchURL") or search_result.get("SearchURL"),
        "best": candidates[0] if candidates else None,
        "candidates": candidates,
    }


def main():
    parser = argparse.ArgumentParser(description="Amazon Creators API lookup helper")
    subcommands = parser.add_subparsers(dest="command", required=True)

    search = subcommands.add_parser("search")
    search.add_argument("--query", required=True)
    search.add_argument("--search-index", default=None)
    search.add_argument("--marketplace", default=None)
    search.add_argument("--partner-tag", default=None)
    search.add_argument("--item-count", type=int, default=10)
    search.add_argument("--min-rating", type=int, default=None)
    search.add_argument("--min-price", type=int, default=None)
    search.add_argument("--max-price", type=int, default=None)

    args = parser.parse_args()

    try:
        if args.command == "search":
            result = search_items(args)
        else:
            raise RuntimeError(f"Unknown command: {args.command}")
        print(json.dumps(result, indent=2))
    except Exception as exc:
        print(json.dumps({"ok": False, "error": str(exc)}, indent=2))
        sys.exit(1)


if __name__ == "__main__":
    main()
