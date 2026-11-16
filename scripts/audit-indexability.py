#!/usr/bin/env python3
"""Read-only indexability audit of the published sitemap URLs. No account credentials required."""
from collections import Counter
from html.parser import HTMLParser
from urllib.parse import urlsplit, urlunsplit
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
import ssl
import time
import xml.etree.ElementTree as ET

DOMAIN = "dein-snackautomat.de"
SITEMAP = "https://" + DOMAIN + "/sitemap.xml"

class MetaParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.robots = []
        self.canonicals = []
        self.in_title = False
        self.title = ""
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "meta" and a.get("name", "").lower() in ("robots", "googlebot"):
            self.robots.append(a.get("content", ""))
        if tag == "link" and a.get("rel", "").lower() == "canonical":
            self.canonicals.append(a.get("href", ""))
        if tag == "title": self.in_title = True
    def handle_endtag(self, tag):
        if tag == "title": self.in_title = False
    def handle_data(self, data):
        if self.in_title: self.title += data

def fetch(url):
    req = Request(url, headers={"User-Agent":"dein-snackautomat-seo-selfcheck/1.0 (+site owner)", "Accept":"text/html,application/xml"})
    with urlopen(req, timeout=16) as response:
        return response.getcode(), response.url, response.read(600000).decode("utf-8", "replace")

def canonical_key(url):
    p = urlsplit(url)
    return urlunsplit((p.scheme, p.netloc.lower(), p.path or "/", p.query, ""))

def main():
    code, final, raw = fetch(SITEMAP)
    assert code == 200 and final.startswith("https://"+DOMAIN), "Sitemap unreachable"
    root = ET.fromstring(raw)
    urls = [node.text.strip() for node in root.iter() if node.tag.endswith("}loc") and node.text]
    print(f"SITEMAP: {len(urls)} URLs")
    issues, stats = [], Counter()
    for index, url in enumerate(urls, 1):
        try:
            if urlsplit(url).netloc != DOMAIN:
                issues.append(f"OUTSIDE_DOMAIN {url}"); continue
            status, final, html = fetch(url)
            stats[status] += 1
            p=MetaParser()
            p.feed(html)
            if status != 200: issues.append(f"HTTP_{status} {url}")
            if canonical_key(final) != canonical_key(url):
                issues.append(f"REDIRECT {url} -> {final}")
            if any("noindex" in x.lower() for x in p.robots):
                issues.append(f"NOINDEX_IN_SITEMAP {url}")
            if len(p.canonicals)>1:
                issues.append(f"MULTIPLE_CANONICALS {url}")
            # Product URLs get JS-generated canonicals: report, do not misdiagnose as wrong.
            elif not p.canonicals and "/produkt.html?" not in url:
                issues.append(f"CANONICAL_NOT_IN_STATIC_HTML {url}")
            elif p.canonicals and canonical_key(p.canonicals[0])!=canonical_key(url):
                issues.append(f"CANONICAL_DIFFERENT {url} -> {p.canonicals[0]}")
            if "not found" in p.title.lower() or "404" == p.title.strip():
                issues.append(f"ERROR_TITLE {url}")
        except (HTTPError, URLError, ssl.SSLError, TimeoutError, ValueError) as exc:
            issues.append(f"REQUEST_FAILED {url}: {type(exc).__name__} {str(exc)[:180]}")
        if index % 25 == 0: print(f"Processed {index} / {len(urls)}")
        time.sleep(0.08)
    print("HTTP_COUNTS:",dict(stats))
    for issue in issues[:140]: print("FINDING", issue)
    print(f"TOTAL_FINDINGS={len(issues)}")
    # External condition that causes real index loss should fail CI; absence of a
    # static canonical on an intentionally JS-rendered product page is a warning.
    blockers=[x for x in issues if x.startswith(("HTTP_", "NOINDEX_IN_SITEMAP", "REQUEST_FAILED", "CANONICAL_DIFFERENT", "REDIRECT", "MULTIPLE_CANONICALS"))]
    print(f"BLOCKERS={len(blockers)}")
    if blockers: raise SystemExit(1)
if __name__ == "__main__": main()
