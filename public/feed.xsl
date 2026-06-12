<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  exclude-result-prefixes="atom dc">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title><xsl:value-of select="/rss/channel/title"/> — RSS Feed</title>
        <style>
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f9fafb; color: #111827; line-height: 1.6; }
          .container { max-width: 800px; margin: 0 auto; padding: 2rem 1rem; }
          .header { background: linear-gradient(135deg, #059669, #0d9488); color: #fff; border-radius: 1rem; padding: 2rem; margin-bottom: 2rem; }
          .header h1 { font-size: 1.75rem; font-weight: 800; margin-bottom: 0.25rem; }
          .header p { opacity: 0.85; font-size: 0.95rem; margin-bottom: 1rem; }
          .rss-badge { display: inline-flex; align-items: center; gap: 0.4rem; background: rgba(255,255,255,0.2); border-radius: 9999px; padding: 0.3rem 0.8rem; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.05em; }
          .rss-badge svg { width: 14px; height: 14px; fill: #fff; }
          .hint { background: #fff; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1rem 1.25rem; margin-bottom: 2rem; font-size: 0.85rem; color: #6b7280; }
          .hint strong { color: #374151; }
          .items { display: flex; flex-direction: column; gap: 1rem; }
          .item { background: #fff; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.25rem 1.5rem; transition: box-shadow 0.15s; }
          .item:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.07); }
          .item-category { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #059669; margin-bottom: 0.4rem; }
          .item-title a { font-size: 1.05rem; font-weight: 700; color: #111827; text-decoration: none; }
          .item-title a:hover { color: #059669; }
          .item-desc { font-size: 0.9rem; color: #6b7280; margin: 0.5rem 0 0.75rem; }
          .item-meta { font-size: 0.78rem; color: #9ca3af; }
          @media (prefers-color-scheme: dark) {
            body { background: #0f172a; color: #f1f5f9; }
            .hint { background: #1e293b; border-color: #334155; color: #94a3b8; }
            .hint strong { color: #e2e8f0; }
            .item { background: #1e293b; border-color: #334155; }
            .item-title a { color: #f1f5f9; }
            .item-title a:hover { color: #34d399; }
            .item-desc { color: #94a3b8; }
            .item-meta { color: #64748b; }
            .item-category { color: #34d399; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1><xsl:value-of select="/rss/channel/title"/></h1>
            <p><xsl:value-of select="/rss/channel/description"/></p>
            <span class="rss-badge">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19.01 7.38 20 6.18 20C4.98 20 4 19.01 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z"/></svg>
              RSS Feed
            </span>
          </div>

          <div class="hint">
            <strong>This is an RSS feed.</strong> Subscribe by copying the URL into your feed reader (e.g. Feedly, Inoreader, NetNewsWire).
          </div>

          <div class="items">
            <xsl:for-each select="/rss/channel/item">
              <div class="item">
                <div class="item-category"><xsl:value-of select="category[1]"/></div>
                <div class="item-title">
                  <a>
                    <xsl:attribute name="href"><xsl:value-of select="link"/></xsl:attribute>
                    <xsl:value-of select="title"/>
                  </a>
                </div>
                <div class="item-desc"><xsl:value-of select="description"/></div>
                <div class="item-meta">
                  <xsl:value-of select="pubDate"/> · <xsl:value-of select="author"/>
                </div>
              </div>
            </xsl:for-each>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
