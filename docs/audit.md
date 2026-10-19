# Reference site audit — faq.miniorange.in

Audited 13 Oct 2026 by following live links in a browser and by fetching pages with
`scripts/import-faq.mjs`. Everything below was observed on the live site; nothing is assumed.

> **Note on access.** `https://faq.miniorange.in/robots.txt` describes the host as a
> *"Staging environment — crawling and indexing are not permitted"* and disallows all bots.
> The content was imported once, on request, as a migration of miniOrange's own content,
> at 2 concurrent requests with back-off. The WordPress REST API (`/wp-json/`) returned
> HTTP 502 and was not used. Some requests were rate-limited (HTTP 405) and retried.

## 1. Platform

- WordPress with the "Manual" knowledge-base theme. Articles are post type `manual_kb`,
  categories are the `kb` taxonomy.
- URL patterns: categories `/kb/<product>/` and `/kb/<product>/<topic>/`;
  articles `/knowledgebase/<slug>/`; search `/?s=<term>&post_type=manual_kb`.
- Sitemaps: `/sitemap.xml` → `manual_kb-sitemap.xml` (1,000 URLs) + `manual_kb-sitemap2.xml` (49 URLs).

## 2. Sitemap (existing)

```
/                                  Homepage (hero search, product grid, recently updated)
├── /kb/<product>/                 25 products ("Browse FAQs by product")
│   └── /kb/<product>/<topic>/     57 topics under 13 products
├── /knowledgebase/<slug>/         1,049 articles
├── /?s=<term>                     Search results
└── 404 page                       WordPress "Page not found"
External (header / footer): miniorange.com, miniorange.in, plugins.miniorange.com,
developers.miniorange.com/docs, forum.miniorange.com, YouTube, social profiles.
```

## 3. Global navigation

**Header** (links to miniorange.com): Products (Single Sign-On, Multi-Factor Authentication,
User Lifecycle Management, Privileged Access Management, Unified Endpoint Management,
Data Privacy & Protection, Data Loss Prevention, Mobile Device Management) · Plugins (Shopify
Apps, WordPress Plugins, Atlassian Plugins, Drupal Plugins, Joomla Extensions, Magento
Extensions) · Resources (Documentation, FAQs, Forum, Blog, Webinars, Videos, Content Library) ·
Company (About Us, Why miniOrange, Customers, News, Careers, Become a Partner) · **Free Trial** CTA.
A "Skip to content" link exists.

**Footer** (links to miniorange.in): phone +1 978 658 9387 (US), +91 97178 45846 (India),
info@xecurify.com, Contact Us; social (LinkedIn, YouTube, X/Twitter, Facebook); columns
Products, Plugins, Why miniOrange, Company; Privacy Policy, Terms of Service, Cookies Preferences
(`#` link, no destination observed).

All of these are preserved in `src/data/navigation.json` and `src/data/site-config.json`.

## 4. Homepage

- Eyebrow "miniOrange Knowledge Base", H1 "Find answers, setup help & troubleshooting", lead text.
- Search form: text field (`s`) plus a **post-type select** (All Site, Post, Page, Knowledge Base,
  FAQs, Portfolio, Documentation) and a Search button. A `livesearch` script is loaded
  (admin-ajax); no suggestions were observed during the audit.
- "Trending searches:" label is rendered **empty** — no trending data is published.
- Buttons "Browse products" (anchor) and "Contact support" (→ miniorange.in/contact).
- "Browse FAQs by product": 6 primary product tiles with logos (IAM, Atlassian, SAML Single Sign On
  for WordPress, Shopify, ASP.NET, Drupal), then "More products & topics" (19 text links). A
  "Filter products" input exists in markup but is `hidden`.
- "Recently updated articles": 6 articles with product label and date.
- A hidden support form (`#support-form`) is present in markup: honeypot "Company", email*
  (required), contact number (pattern `[0-9]{6,15}`), "What are you looking for?"* select
  (Schedule a Demo / Technical Support / Sales Enquiry / Custom requirement / Not listed),
  "How can we help you?"* textarea. It POSTs to the same page (server-side handler, no public API).

## 5. Category pages

- Breadcrumb "home / Knowledge Base / <Product> / <Topic>", H1 = category name. No descriptions.
- Products with topics show a 2-column grid of topic boxes: 3 sample questions + "View All N".
- Then a flat list of questions, each with **views**, **date** and **likes**.
- Parent pages also list questions that belong to their topics (e.g. Shopify lists 173 questions,
  its topics hold 187). No pagination, sorting or filtering. All questions render at once.

## 6. Article pages

- Breadcrumb up to the topic, H2 title (no H1), views / date / likes metadata.
- Body HTML: paragraphs, ordered/unordered lists (often nested), bold/italic, screenshots
  (`/wp-content/uploads/...`, some very large), tables, links, inline Font Awesome icons,
  `<pre>` code, occasional YouTube embeds, in-page anchors ("Step 3").
- "Was this helpful?" Yes/No with counts (AJAX to admin-ajax; not callable from another origin).
- "Related Articles" list (curated, usually same topic).
- `article:modified_time` meta used as the update date.

## 7. Search

- `?s=license&post_type=knowledgebase` (the wrong post type) → "Sorry!! nothing found…".
- `?s=license` or `post_type=manual_kb` → 10 results per page, title + date only, empty
  excerpt (`<p class="search-content"></p>`), no counts, no facets.
- The query is not echoed back into the hero field after searching.
- No-results text: "Sorry!! nothing found related to your search topic, please try search again."

## 8. Other states

- Unknown article URL → HTTP 404 with WordPress 404 page.
- Contact support leaves the FAQ site (miniorange.in/contact).
- No loading states (server-rendered). Images are lazy-loaded.

## 9. User journeys observed and problems found

| Journey | Existing path | Friction | New portal |
|---|---|---|---|
| A. Search | Home → type → submit → results → article | Search scope select is confusing (Portfolio, Page…); results have no excerpt, count or category; query not kept; no suggestions | Autocomplete (questions + categories), results with excerpt, highlight, count, product facets, partial-match fallback; query kept in URL and field; Back returns to the same results |
| B. Browse | Home → product → (topic) → article | Long unpaged lists; no filter/sort; parent lists mix topic questions without labels | Topic chips with counts, in-category filter, sort, pagination; state in URL, Back restores it |
| C. Discover | Home → recently updated → article | No "popular"; trending empty | "Most viewed" (from source view counters) + "Recently updated"; related questions on every article |
| D. Support | "Contact support" leaves the site; support form hidden | No contextual support on articles | `/support` with the source form fields + validation; contextual links from articles and "No" feedback pre-fill the article |
| E. Direct entry | `/kb/...` and `/knowledgebase/...` | — | Same URLs work; breadcrumbs to product/topic; 404 with similar-question suggestions |

## 10. Import result

- 25 products + 57 topics = **82 categories** (all of them).
- **1,048** questions are listed on category pages; the sitemap has **1,049**
  (`is-it-safe-to-use-mcp-with-wordpress` is in the sitemap but not listed in any category).
- As requested, the portal holds a **representative sample: up to 10 questions per category**,
  choosing the most viewed (source view counters). **548 questions** imported with full bodies.
- 4 selected articles returned no title/body and were skipped:
  `license-activation-steps-for-miniorange-asp-net-saml-sso-plugins`,
  `license-activation-steps-for-miniorange-umbraco-saml-sso-plugins`,
  `connect-specific-sharepoint-sites-to-wordpress`, `how-to-get-the-loopring-api-key`.
- Related-article links pointing at questions outside the sample are dropped from
  `relatedFaqIds`; links inside article bodies to such questions open the source site.
- Full details: `docs/import-report.json`.

## 11. Category inventory

"Questions on source" = questions listed on that category page (for products: including topics).

| Product / topic | URL | Questions on source | Imported |
|---|---|---:|---:|
| **Identity & Access Management** (featured) | /kb/idp/ | 122 | 87 |
| &nbsp;&nbsp;↳ Admin | /kb/idp/admin/ | 30 | 10 |
| &nbsp;&nbsp;↳ BigCommerce | /kb/idp/bigcommerce/ | 4 | 4 |
| &nbsp;&nbsp;↳ Deskpro | /kb/idp/deskpro/ | 1 | 1 |
| &nbsp;&nbsp;↳ End Users | /kb/idp/users/ | 5 | 5 |
| &nbsp;&nbsp;↳ General | /kb/idp/general-idp/ | 15 | 10 |
| &nbsp;&nbsp;↳ Legacy | /kb/idp/legacy/ | 10 | 10 |
| &nbsp;&nbsp;↳ MFA | /kb/idp/mfa/ | 11 | 10 |
| &nbsp;&nbsp;↳ PAM | /kb/idp/pam/ | 7 | 7 |
| &nbsp;&nbsp;↳ SSO | /kb/idp/sso/ | 12 | 10 |
| &nbsp;&nbsp;↳ Thinkific | /kb/idp/thinkific/ | 4 | 4 |
| &nbsp;&nbsp;↳ Webflow | /kb/idp/webflow/ | 2 | 2 |
| &nbsp;&nbsp;↳ Wix | /kb/idp/wix/ | 4 | 4 |
| **Atlassian** (featured) | /kb/atlassian/ | 130 | 78 |
| &nbsp;&nbsp;↳ Access Reviewer360 | /kb/atlassian/access-reviewer-360/ | 15 | 10 |
| &nbsp;&nbsp;↳ Automated User Management | /kb/atlassian/automated-user-management/ | 9 | 9 |
| &nbsp;&nbsp;↳ Common | /kb/atlassian/common/ | 4 | 4 |
| &nbsp;&nbsp;↳ Git Authentication | /kb/atlassian/git-authentication/ | 4 | 4 |
| &nbsp;&nbsp;↳ Kerberos | /kb/atlassian/kerberos-atlassian/ | 3 | 3 |
| &nbsp;&nbsp;↳ Licensing | /kb/atlassian/licensing-atlassian/ | 5 | 5 |
| &nbsp;&nbsp;↳ OAuth | /kb/atlassian/oauth/ | 32 | 10 |
| &nbsp;&nbsp;↳ Pricing | /kb/atlassian/pricing-atlassian/ | 3 | 3 |
| &nbsp;&nbsp;↳ SAML | /kb/atlassian/saml/ | 29 | 10 |
| &nbsp;&nbsp;↳ Secure Share | /kb/atlassian/secure-share/ | 2 | 2 |
| &nbsp;&nbsp;↳ Two Factor Authentication | /kb/atlassian/two-factor-authentication-atlassian/ | 16 | 10 |
| &nbsp;&nbsp;↳ User Provisioning | /kb/atlassian/user-provisioning/ | 8 | 8 |
| **SAML Single Sign On for WordPress** (featured) | /kb/saml-single-sign-on/ | 169 | 63 |
| &nbsp;&nbsp;↳ Certificate | /kb/saml-single-sign-on/certificate/ | 14 | 10 |
| &nbsp;&nbsp;↳ General | /kb/saml-single-sign-on/general-saml-single-sign-on/ | 36 | 10 |
| &nbsp;&nbsp;↳ IDP for WordPress | /kb/saml-single-sign-on/wordpress-idp/ | 6 | 6 |
| &nbsp;&nbsp;↳ IDP Specific | /kb/saml-single-sign-on/idp-specific/ | 38 | 10 |
| &nbsp;&nbsp;↳ Licensing | /kb/saml-single-sign-on/licensing-saml-single-sign-on/ | 14 | 10 |
| &nbsp;&nbsp;↳ SSO Issues | /kb/saml-single-sign-on/sso-issues/ | 54 | 10 |
| **Shopify** (featured) | /kb/shopify/ | 187 | 73 |
| &nbsp;&nbsp;↳ Shopify Content Restriction | /kb/shopify/shopify-content-restriction/ | 31 | 10 |
| &nbsp;&nbsp;↳ Shopify Customer Accounts | /kb/shopify/shopify-customer-accounts/ | 5 | 5 |
| &nbsp;&nbsp;↳ Shopify Discord Integration | /kb/shopify/shopify-discord-integration/ | 3 | 3 |
| &nbsp;&nbsp;↳ Shopify Firewall IP Restrict | /kb/shopify/shopify-firewall-ip-restrict/ | 11 | 10 |
| &nbsp;&nbsp;↳ Shopify Inventory Sync | /kb/shopify/shopify-inventory-sync/ | 3 | 3 |
| &nbsp;&nbsp;↳ Shopify miscellaneous | /kb/shopify/shopify-miscellaneous/ | 40 | 10 |
| &nbsp;&nbsp;↳ Shopify B2B | /kb/shopify/shopify-b2b/ | 26 | 10 |
| &nbsp;&nbsp;↳ Shopify OTP Login | /kb/shopify/shopify-otp-login/ | 17 | 10 |
| &nbsp;&nbsp;↳ Shopify SMS Notification | /kb/shopify/shopify-sms-notification/ | 2 | 2 |
| &nbsp;&nbsp;↳ Shopify SSO | /kb/shopify/shopify-sso/ | 49 | 10 |
| **ASP.NET** (featured) | /kb/asp-net/ | 22 | 19 |
| &nbsp;&nbsp;↳ License | /kb/asp-net/license/ | 10 | 8 |
| &nbsp;&nbsp;↳ Products | /kb/asp-net/products/ | 11 | 10 |
| **Drupal** (featured) | /kb/drupal/ | 64 | 48 |
| &nbsp;&nbsp;↳ API Authentication | /kb/drupal/api-authentication-drupal/ | 5 | 5 |
| &nbsp;&nbsp;↳ LDAP | /kb/drupal/drupal-ldap/ | 15 | 10 |
| &nbsp;&nbsp;↳ OAuth / OIDC Single Sign On | /kb/drupal/drupal-oauth-oidc-sso/ | 13 | 10 |
| &nbsp;&nbsp;↳ SAML | /kb/drupal/saml-drupal/ | 13 | 10 |
| &nbsp;&nbsp;↳ Two Factor Authentication | /kb/drupal/two-factor-authentication-drupal/ | 15 | 10 |
| **Unified Endpoint Management** | /kb/unified-endpoint-management/ | 34 | 16 |
| &nbsp;&nbsp;↳ Android MDM | /kb/unified-endpoint-management/android-mdm/ | 6 | 6 |
| **AI Solutions for WordPress** | /kb/wordpress-ai/ | 12 | 12 |
| &nbsp;&nbsp;↳ AI Governance | /kb/wordpress-ai/ai-governance/ | 7 | 7 |
| &nbsp;&nbsp;↳ AI Studio | /kb/wordpress-ai/ai-studio/ | 5 | 5 |
| **Joomla** | /kb/joomla/ | 18 | 17 |
| &nbsp;&nbsp;↳ General | /kb/joomla/general-joomla/ | 4 | 4 |
| &nbsp;&nbsp;↳ Import-Export | /kb/joomla/joomla-import-export/ | 1 | 1 |
| &nbsp;&nbsp;↳ LDAP | /kb/joomla/ldap/ | 2 | 2 |
| &nbsp;&nbsp;↳ SAML | /kb/joomla/joomla-saml/ | 11 | 10 |
| **Azure AD / Office365 Integrations** | /kb/azure-ad-integration/ | 22 | 21 |
| &nbsp;&nbsp;↳ Power BI | /kb/azure-ad-integration/powerbi/ | 8 | 8 |
| &nbsp;&nbsp;↳ SharePoint | /kb/azure-ad-integration/sharepoint/ | 10 | 9 |
| **CASB** | /kb/casb/ | 1 | 1 |
| **Data Loss Prevention** | /kb/data-loss-prevention/ | 14 | 10 |
| **Data Privacy / DPDP** | /kb/dpdp/ | 37 | 10 |
| **General** | /kb/general/ | 18 | 10 |
| **Jenkins** | /kb/jenkins/ | 4 | 4 |
| **LDAP Authentication** | /kb/ldap-authentication/ | 21 | 10 |
| **Licensing** | /kb/licensing/ | 8 | 8 |
| **Windows Single Sign On** | /kb/windows-single-sign-on/ | 9 | 9 |
| **Reverse Proxy** | /kb/reverse-proxy/ | 7 | 7 |
| &nbsp;&nbsp;↳ Google Extension | /kb/reverse-proxy/google-extension/ | 7 | 7 |
| **Network Security** | /kb/network-security/ | 2 | 2 |
| **OAuth / OpenID Connect** | /kb/oauth-openid-connect/ | 57 | 10 |
| **OAuth Server** | /kb/oauth-server/ | 4 | 4 |
| **OTP Verification** | /kb/otp-verification/ | 31 | 10 |
| **Two-Factor Authentication** | /kb/two-factor-authentication/ | 38 | 10 |
| **Web3** | /kb/web3/ | 17 | 9 |
