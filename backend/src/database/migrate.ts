import pool from './config.js';

async function migrate() {
  try {
    console.log('Starting database migration...');

    // Users table (for admin authentication)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Users table created');

    // Menus table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS menus (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(name)
      )
    `);
    console.log('✓ Menus table created');

    // Menu items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        menu_id UUID REFERENCES menus(id) ON DELETE CASCADE,
        label VARCHAR(255) NOT NULL,
        href VARCHAR(500) NOT NULL,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Menu items table created');

    // Content sections table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS content_sections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        section_id VARCHAR(100) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        content JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Content sections table created');

    // RSS feeds table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rss_feeds (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        url VARCHAR(500) NOT NULL,
        categories TEXT[] NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ RSS feeds table created');

    // Pages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        content TEXT NOT NULL,
        meta_title VARCHAR(255),
        meta_description TEXT,
        is_published BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Pages table created');

    // Media table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS media (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        url TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        size BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Media table created');

    // Create indexes
    await pool.query('CREATE INDEX IF NOT EXISTS idx_menu_items_menu_id ON menu_items(menu_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_pages_is_published ON pages(is_published)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_rss_feeds_is_active ON rss_feeds(is_active)');
    console.log('✓ Indexes created');

    // Insert default admin user (username: admin, password: admin123)
    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.default.hash('admin123', 10);

    await pool.query(`
      INSERT INTO users (username, password_hash)
      VALUES ('admin', $1)
      ON CONFLICT (username) DO NOTHING
    `, [passwordHash]);
    console.log('✓ Default admin user created (username: admin, password: admin123)');

    // Insert default menus
    await pool.query(`
      INSERT INTO menus (name) VALUES ('header'), ('footer')
      ON CONFLICT (name) DO NOTHING
    `);
    console.log('✓ Default menus created');

    // Insert default header menu items
    const headerMenuId = await pool.query("SELECT id FROM menus WHERE name = 'header'");
    if (headerMenuId.rows.length > 0) {
      const menuId = headerMenuId.rows[0].id;
      const defaultHeaderItems = [
        { label: '首頁', href: '/#home', order: 0 },
        { label: '關於瑞信', href: '/#about', order: 1 },
        { label: '服務項目', href: '/#services', order: 2 },
        { label: '服務流程', href: '/#process', order: 3 },
        { label: '即時新聞', href: '/#news', order: 4 },
        { label: '徵信知識', href: '/#knowledge', order: 5 },
        { label: '常見問題', href: '/#faq', order: 6 },
        { label: '聯絡諮詢', href: '/#contact', order: 7 },
      ];

      for (const item of defaultHeaderItems) {
        await pool.query(`
          INSERT INTO menu_items (menu_id, label, href, order_index)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT DO NOTHING
        `, [menuId, item.label, item.href, item.order]);
      }
      console.log('✓ Default header menu items created');
    }

    // Insert default footer menu items
    const footerMenuId = await pool.query("SELECT id FROM menus WHERE name = 'footer'");
    if (footerMenuId.rows.length > 0) {
      const menuId = footerMenuId.rows[0].id;
      const defaultFooterItems = [
        { label: '關於瑞信', href: '/#about', order: 0 },
        { label: '服務項目', href: '/#services', order: 1 },
        { label: '服務流程', href: '/#process', order: 2 },
        { label: '即時新聞', href: '/#news', order: 3 },
        { label: '徵信知識', href: '/#knowledge', order: 4 },
        { label: '常見問題', href: '/#faq', order: 5 },
        { label: '聯絡諮詢', href: '/#contact', order: 6 },
      ];

      for (const item of defaultFooterItems) {
        await pool.query(`
          INSERT INTO menu_items (menu_id, label, href, order_index)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT DO NOTHING
        `, [menuId, item.label, item.href, item.order]);
      }
      console.log('✓ Default footer menu items created');
    }

    // Insert default content sections
    const defaultContent = [
      {
        section_id: 'hero',
        title: 'Hero Section',
        content: {
          tag: '專業資訊調查與風險評估',
          title: '瑞信徵信社｜專業調查、合法程序、重視保密',
          subtitle: '專業調查｜合法程序｜重視保密',
          desc: '面對關係疑慮、商業合作與重要決策，正確資訊是釐清問題的第一步。瑞信徵信社透過專業資訊整理與合法調查程序，協助個人與企業掌握事實、降低風險。',
          image: '/hero.png',
          ctaPrimary: '立即諮詢',
          ctaSecondary: '了解服務',
          badge1: '專業分析',
          badge2: '合法程序',
          badge3: '客觀評估',
          badge4: '資訊保密'
        }
      },
      {
        section_id: 'about',
        title: 'About Section',
        content: {
          tag: '關於瑞信',
          title: '以事實為基礎，協助您做出更清楚的判斷',
          desc1: '瑞信徵信社以專業、客觀與保密為服務原則，提供婚姻徵信、商業調查及企業風險管理相關服務。',
          desc2: '我們重視每一項委託背後的實際需求，從初步諮詢、問題評估到資訊整理，皆以合法程序與謹慎態度進行。',
          desc3: '徵信服務的目的，不是製造衝突，而是協助委託人降低資訊落差、釐清事實，為後續行動提供更完整的判斷依據。',
          quote: '真相，是每一次正確決策的開始。'
        }
      },
      {
        section_id: 'footer',
        title: 'Footer Section',
        content: {
          logo: '瑞信徵信社',
          desc: '提供婚姻徵信、商業調查與企業風險管理相關服務，協助個人與企業釐清資訊、降低風險。',
          disclaimer: '本網站內容為一般資訊與服務介紹，不構成法律意見。實際案件應依個別情況進行評估，必要時應諮詢專業律師。',
          copyright: '© 2026 瑞信徵信社 All Rights Reserved.'
        }
      }
    ];

    for (const section of defaultContent) {
      await pool.query(`
        INSERT INTO content_sections (section_id, title, content)
        VALUES ($1, $2, $3)
        ON CONFLICT (section_id) DO NOTHING
      `, [section.section_id, section.title, JSON.stringify(section.content)]);
    }
    console.log('✓ Default content sections created');

    // Insert default RSS feed
    await pool.query(`
      INSERT INTO rss_feeds (name, url, categories, is_active)
      VALUES ($1, $2, $3, true)
      ON CONFLICT DO NOTHING
    `, [
      '中華超傳媒',
      'https://chinanewscloud.com/api/v1/rss-news',
      ['財經新聞', '產經新聞', '房產新聞', '產業新聞', '最新消息', '兩岸新聞', '社會政治', '國際要聞', '資訊科技']
    ]);
    console.log('✓ Default RSS feed created');

    console.log('\n✅ Database migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
