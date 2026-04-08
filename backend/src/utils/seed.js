const { sequelize, testConnection } = require('../config/database');

const seedMenuItems = async () => {
  try {
    console.log('🌱 Starting menu items seed...');
    await testConnection();

    // Disable FK checks so we can truncate safely
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.query('TRUNCATE TABLE menu_items');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('🗑️  Cleared existing menu items');

    const items = [
      // ── BREAKFAST (10) ────────────────────────────────────────────────────
      { name: 'Idli Sambar',    description: 'Soft steamed rice idlis served with piping hot sambar and fresh coconut chutney',                     price: 80,  category: 'Breakfast', image_url: 'https://images.unsplash.com/photo-1657196118354-f25f29fe636d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8aWRsaSUyMHNhbWJhcnxlbnwwfHwwfHx8MA%3D%3D', preparation_time: 10, is_available: true },
      { name: 'Masala Dosa',    description: 'Crispy golden dosa stuffed with spiced potato masala, served with sambar & chutneys',                 price: 110, category: 'Breakfast', image_url: 'https://images.unsplash.com/photo-1694849789325-914b71ab4075?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWFzYWxhJTIwZG9zYXxlbnwwfHwwfHx8MA%3D%3D', preparation_time: 15, is_available: true },
      { name: 'Plain Dosa',     description: 'Thin crispy fermented rice and lentil crepe served with sambar and coconut chutney',                  price: 90,  category: 'Breakfast', image_url: 'https://images.unsplash.com/photo-1708146464361-5c5ce4f9abb6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bWFzYWxhJTIwZG9zYXxlbnwwfHwwfHx8MA%3D%3D', preparation_time: 12, is_available: true },
      { name: 'Medu Vada',      description: 'Crispy fried urad dal donuts served with sambar and coconut chutney',                                 price: 70,  category: 'Breakfast', image_url: 'https://images.unsplash.com/photo-1730191843435-073792ba22bc?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dmFkYXxlbnwwfHwwfHx8MA%3D%3D', preparation_time: 12, is_available: true },
      { name: 'Upma',           description: 'Savory semolina porridge tempered with mustard seeds, curry leaves, onions and vegetables',           price: 75,  category: 'Breakfast', image_url: 'https://www.indianveggiedelight.com/wp-content/uploads/2019/06/rava_upma-1-1.jpg', preparation_time: 10, is_available: true },
      { name: 'Poha',           description: 'Light flattened rice dish with turmeric, onions, peas, and a squeeze of lemon',                       price: 65,  category: 'Breakfast', image_url: 'https://www.vegrecipesofindia.com/wp-content/uploads/2022/09/poha-recipe-1.jpg', preparation_time: 10, is_available: true },
      { name: 'Rava Idli',      description: 'Soft semolina idlis with cashews and curry leaves, served with chutney',                              price: 85,  category: 'Breakfast', image_url: 'https://www.vegrecipesofindia.com/wp-content/uploads/2013/11/rava-idli-5.jpg', preparation_time: 12, is_available: true },
      { name: 'Puri Bhaji',     description: 'Deep fried fluffy puris served with spiced potato bhaji — a classic morning treat',                   price: 95,  category: 'Breakfast', image_url: 'https://www.vegrecipesofindia.com/wp-content/uploads/2013/03/poori-bhaji.jpg', preparation_time: 15, is_available: true },
      { name: 'Bisi Bele Bath', description: 'Karnataka-style spiced rice and lentil one-pot dish with vegetables and ghee',                        price: 100, category: 'Breakfast', image_url: 'https://www.vegrecipesofindia.com/wp-content/uploads/2025/07/bisi-bele-bath-1.jpg', preparation_time: 20, is_available: true },
      { name: 'Aloo Paratha',   description: 'Whole wheat flatbread stuffed with spiced mashed potatoes, served with curd and pickle',              price: 90,  category: 'Breakfast', image_url: 'https://www.vegrecipesofindia.com/wp-content/uploads/2022/11/aloo-paratha-recipe-2.jpg', preparation_time: 15, is_available: true },

      // ── LUNCH (10) ────────────────────────────────────────────────────────
      { name: 'Veg Thali',         description: 'Complete meal with rice, 2 sabzis, dal, roti, papad, pickle and sweet',                           price: 180, category: 'Lunch', image_url: 'https://blogger.googleusercontent.com/img/a/AVvXsEjxSed69ye7R4l7GlxQkdaa2BLJ3A0JGIIFfHrZvZx3OKu_YdeHkLOaFzUN7AazDH4L-u5oM1jP-Sna-H4m_WcC1oJuUO3vlImEQGcBQ_M_xWNGkWl_UzKNyObh3DzuALE_-0xjS4FTvpknGzGAYep3JkoFk2ygSJE_mWC324wmODLWB5ciRMOeTJNWEAmc', preparation_time: 20, is_available: true },
      { name: 'Chicken Biryani',   description: 'Aromatic basmati rice layered with tender chicken, saffron and whole spices',                     price: 220, category: 'Lunch', image_url: 'https://images.unsplash.com/photo-1719239885399-f87d992e0f18?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Y2hpY2tlbiUyMGJpcnlhbml8ZW58MHx8MHx8fDA%3D', preparation_time: 30, is_available: true },
      { name: 'Veg Biryani',       description: 'Fragrant basmati rice with seasonal vegetables, mint and fried onions',                           price: 170, category: 'Lunch', image_url: 'https://images.unsplash.com/photo-1630409346824-4f0e7b080087?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dmVnJTIwYmlyeWFuaXxlbnwwfHwwfHx8MA%3D%3D', preparation_time: 25, is_available: true },
      { name: 'Dal Rice',          description: 'Comfort bowl of steamed rice with yellow dal tadka, ghee and papad',                              price: 120, category: 'Lunch', image_url: 'https://images.unsplash.com/photo-1727018953313-403d17215a1b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZGFhbCUyMHJpY2V8ZW58MHx8MHx8fDA%3D', preparation_time: 15, is_available: true },
      { name: 'Curd Rice',         description: 'South Indian comfort — creamy curd rice tempered with mustard, curry leaves and pomegranate',     price: 100, category: 'Lunch', image_url: 'https://images.unsplash.com/photo-1633383718081-22ac93e3db65?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y3VyZCUyMHJpY2V8ZW58MHx8MHx8fDA%3D', preparation_time: 10, is_available: true },
      { name: 'Rajma Chawal',      description: 'Slow-cooked kidney beans in tomato-onion gravy served over steamed basmati rice',                 price: 150, category: 'Lunch', image_url: 'https://images.unsplash.com/photo-1668236534990-73c4ed23043c?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', preparation_time: 20, is_available: true },
      { name: 'Sambar Rice',       description: 'Hot tangy sambar poured over steamed rice with a dollop of ghee and fried papad',                 price: 110, category: 'Lunch', image_url: 'https://www.vegrecipesofindia.com/wp-content/uploads/2017/10/sambar-rice-recipe.jpg', preparation_time: 15, is_available: true },
      { name: 'Chicken Curry Rice',description: 'Home-style chicken curry in a coconut-based gravy, served with rice',                             price: 200, category: 'Lunch', image_url: 'https://www.chelseasmessyapron.com/wp-content/uploads/2015/02/Chicken-Curry-3.jpg', preparation_time: 25, is_available: true },
      { name: 'Vegetable Pulao',   description: 'Aromatic one-pot rice cooked with whole spices, vegetables and cashews',                          price: 140, category: 'Lunch', image_url: 'https://www.vegrecipesofindia.com/wp-content/uploads/2013/03/veg-pulao.jpg', preparation_time: 20, is_available: true },
      { name: 'Fish Curry Rice',   description: 'Tangy Mangalorean-style fish curry with kokum and coconut milk, served with steamed rice',        price: 230, category: 'Lunch', image_url: 'https://ministryofcurry.com/wp-content/uploads/2020/12/fish-curry-4-1365x2048.jpg', preparation_time: 25, is_available: true },

      // ── DINNER (10) ───────────────────────────────────────────────────────
      { name: 'Butter Chicken',       description: "Tender chicken in a rich, creamy tomato-butter gravy — North India's most beloved dish",      price: 260, category: 'Dinner', image_url: 'https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg', preparation_time: 25, is_available: true },
      { name: 'Paneer Butter Masala', description: 'Soft cottage cheese cubes in a velvety tomato-cashew gravy with aromatic spices',             price: 210, category: 'Dinner', image_url: 'https://www.vegrecipesofindia.com/wp-content/uploads/2020/01/paneer-butter-masala-1.jpg', preparation_time: 20, is_available: true },
      { name: 'Dal Makhani',          description: 'Black lentils slow-cooked overnight with butter and cream — the queen of dals',               price: 190, category: 'Dinner', image_url: 'https://www.vegrecipesofindia.com/wp-content/uploads/2024/02/dal-makhani-recipe-2.jpg', preparation_time: 20, is_available: true },
      { name: 'Butter Naan',          description: 'Soft leavened bread baked in tandoor, brushed generously with butter and garlic',             price: 50,  category: 'Dinner', image_url: 'https://www.vegrecipesofindia.com/wp-content/uploads/2014/11/butter-naan-recipe.jpg', preparation_time: 10, is_available: true },
      { name: 'Roti (3 pcs)',         description: 'Freshly made whole wheat tandoor rotis, served hot with butter',                              price: 45,  category: 'Dinner', image_url: 'https://www.vegrecipesofindia.com/wp-content/uploads/2021/08/roti.jpg', preparation_time: 10, is_available: true },
      { name: 'Palak Paneer',         description: 'Fresh spinach purée with soft paneer cubes in a mildly spiced gravy',                        price: 200, category: 'Dinner', image_url: 'https://www.vegrecipesofindia.com/wp-content/uploads/2021/06/palak-paneer-1.jpg', preparation_time: 20, is_available: true },
      { name: 'Mutton Rogan Josh',    description: 'Kashmiri braised mutton in an aromatic rogan josh gravy with whole spices',                   price: 320, category: 'Dinner', image_url: 'https://www.whiskaffair.com/wp-content/uploads/2019/02/Mutton-Rogan-Josh-2-1.jpg', preparation_time: 35, is_available: true },
      { name: 'Chana Masala',         description: 'Hearty chickpeas in a tangy tomato-onion masala, served with bhatura or rice',                price: 160, category: 'Dinner', image_url: 'https://www.vegrecipesofindia.com/wp-content/uploads/2024/06/chana-masala-recipe.jpg', preparation_time: 15, is_available: true },
      { name: 'Chicken Tikka Masala', description: 'Grilled chicken tikka pieces in a smoky, spiced tomato masala gravy',                        price: 270, category: 'Dinner', image_url: 'https://img-cdn.publive.online/fit-in/1280x960/filters:format(webp)/sanjeev-kapoor/media/media_files/XKERwU0mbrCb56ZwCWqN.jpeg', preparation_time: 25, is_available: true },
      { name: 'Mixed Veg Curry',      description: 'Seasonal vegetables cooked in a home-style onion-tomato gravy with fresh herbs',              price: 150, category: 'Dinner', image_url: 'https://tse1.mm.bing.net/th/id/OIP.aqSEOSpvvGaWJcitsFzLXAHaFj?w=1000&h=750&rs=1&pid=ImgDetMain&o=7&rm=3', preparation_time: 20, is_available: true },

      // ── SWEETS (5) ────────────────────────────────────────────────────────
      { name: 'Gulab Jamun (2 pcs)', description: 'Soft milk-solid dumplings soaked in rose and cardamom sugar syrup',                            price: 70, category: 'Sweets', image_url: 'https://www.vegrecipesofindia.com/wp-content/uploads/2022/10/gulab-jamun-recipe.jpg', preparation_time: 5, is_available: true },
      { name: 'Rasgulla (2 pcs)',    description: 'Light spongy cottage cheese balls soaked in chilled sugar syrup',                              price: 65, category: 'Sweets', image_url: 'https://www.vegrecipesofindia.com/wp-content/uploads/2021/10/rasgulla-recipe-1.jpg', preparation_time: 5, is_available: true },
      { name: 'Kheer',               description: 'Creamy slow-cooked rice pudding with cardamom, saffron and pistachio',                         price: 90, category: 'Sweets', image_url: 'https://www.vegrecipesofindia.com/wp-content/uploads/2013/10/rice-kheer-2.jpg', preparation_time: 5, is_available: true },
      { name: 'Halwa',               description: 'Semolina halwa made with ghee, sugar, cashews and raisins — warm comfort dessert',             price: 80, category: 'Sweets', image_url: 'https://www.vegrecipesofindia.com/wp-content/uploads/2014/03/moong-dal-halwa-recipe15.jpg', preparation_time: 10, is_available: true },
      { name: 'Payasam',             description: 'South Indian vermicelli payasam with condensed milk, cardamom and cashews',                    price: 85, category: 'Sweets', image_url: 'https://www.vegrecipesofindia.com/wp-content/uploads/2025/04/semiya-payasam-1.jpg', preparation_time: 10, is_available: true },

      // ── BEVERAGES (5) ─────────────────────────────────────────────────────
      { name: 'Masala Chai',  description: 'Freshly brewed tea with ginger, cardamom, cinnamon and full-cream milk',                              price: 40, category: 'Beverages', image_url: 'https://www.vegrecipesofindia.com/wp-content/uploads/2021/09/masala-chai-1.jpg', preparation_time: 5, is_available: true },
      { name: 'Filter Coffee',description: 'South Indian filter coffee with chicory, frothed milk — served in davara',                            price: 45, category: 'Beverages', image_url: 'https://www.vegrecipesofindia.com/wp-content/uploads/2016/09/filter-coffee-recipe.jpg', preparation_time: 5, is_available: true },
      { name: 'Sweet Lassi',  description: 'Thick chilled yogurt drink blended with sugar, rose water and cardamom',                              price: 70, category: 'Beverages', image_url: 'https://www.vegrecipesofindia.com/wp-content/uploads/2021/04/lassi-recipe-1.jpg', preparation_time: 5, is_available: true },
      { name: 'Mango Lassi',  description: 'Creamy yogurt blended with Alphonso mango pulp and a pinch of cardamom',                              price: 90, category: 'Beverages', image_url: 'https://tse2.mm.bing.net/th/id/OIP.NzUU0zrNXm9Rtk0qVTzNswHaNN?rs=1&pid=ImgDetMain&o=7&rm=3', preparation_time: 5, is_available: true },
      { name: 'Badam Milk',   description: 'Warm or chilled full-cream milk with almond paste, saffron and cardamom',                             price: 80, category: 'Beverages', image_url: 'https://img-cdn.thepublive.com/fit-in/1280x960/filters:format(webp)/sanjeev-kapoor/media/post_banners/7a6f82b8f824f5dae6cf7a515e0b498e189267778f63fe7742d1fca6da678df6.jpg', preparation_time: 5, is_available: true },

      // ── SNACKS & SIDES (10) ───────────────────────────────────────────────
      { name: 'Samosa (2 pcs)',   description: 'Crispy fried pastry filled with spiced potatoes and peas — perfect with green chutney',          price: 60,  category: 'Snacks', image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80', preparation_time: 8,  is_available: true },
      { name: 'Pav Bhaji',       description: 'Mumbai street-style mashed vegetable bhaji with toasted buttered pav',                            price: 130, category: 'Snacks', image_url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80', preparation_time: 15, is_available: true },
      { name: 'Vada Pav',        description: "Mumbai's iconic street food — spiced potato vada in soft pav with chutneys",                      price: 55,  category: 'Snacks', image_url: 'https://www.vegrecipesofindia.com/wp-content/uploads/2025/12/vada-pav.jpg', preparation_time: 10, is_available: true },
      { name: 'Paneer Tikka',    description: 'Marinated cottage cheese cubes grilled in tandoor with peppers and onions',                       price: 220, category: 'Snacks', image_url: 'https://www.vegrecipesofindia.com/wp-content/uploads/2011/10/grilled-paneer-tikka.jpg', preparation_time: 20, is_available: true },
      { name: 'Chicken 65',      description: 'South Indian spicy deep-fried chicken — crispy, fiery and packed with flavour',                   price: 220, category: 'Snacks', image_url: 'https://tse1.mm.bing.net/th/id/OIP.3qqBvroA0SV-7V4jFWXHwgHaJ4?w=1536&h=2048&rs=1&pid=ImgDetMain&o=7&rm=3', preparation_time: 20, is_available: true },
      { name: 'Masala Papad',    description: 'Crispy roasted papad topped with diced onions, tomatoes, chillies and chaat masala',              price: 50,  category: 'Snacks', image_url: 'https://profusioncurry.com/wp-content/uploads/2021/09/Masala-papad-recipe-close-up-showing-delicious-appetizer-snack-500x500.jpg', preparation_time: 5,  is_available: true },
      { name: 'Raita',           description: 'Chilled yogurt with cucumber, tomato, cumin and fresh coriander',                                 price: 60,  category: 'Sides',  image_url: 'https://www.vegrecipesofindia.com/wp-content/uploads/2025/04/cucumber-raita-recipe.jpg', preparation_time: 5,  is_available: true },
      { name: 'Pickle & Papad',  description: 'Assorted mango and lime pickles with two crispy fried papads',                                    price: 40,  category: 'Sides',  image_url: 'https://mir-s3-cdn-cf.behance.net/project_modules/fs/b9fb78114734511.6040c41b179de.jpg', preparation_time: 3,  is_available: true },
      { name: 'Egg Bhurji',      description: 'Spiced scrambled eggs with onions, tomatoes, chillies and coriander — pairs great with roti',     price: 120, category: 'Snacks', image_url: 'https://tse1.mm.bing.net/th/id/OIP.WCjbqslESgSfDUP2dGi5wQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3', preparation_time: 10, is_available: true },
      { name: 'Kabab',      description: 'Hot crispy chicken kabab perfect for sides and cravings — simple perfection',                          price: 100, category: 'Sides',  image_url: 'https://www.shanazrafiq.com/wp-content/uploads/2022/05/Chicken-Seekh-Kabab.jpg', preparation_time: 15, is_available: true },
    ];

    // Insert one by one using raw SQL to avoid any model field mismatch
    for (const item of items) {
      await sequelize.query(
        `INSERT INTO menu_items (name, description, price, category, image_url, preparation_time, is_available, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [
            item.name, item.description, item.price,
            item.category, item.image_url, item.preparation_time, item.is_available,
          ],
          type: sequelize.QueryTypes.INSERT,
        }
      );
    }

    console.log(`\n✅ Successfully seeded ${items.length} Indian menu items!\n`);
    console.log('📊 Breakdown:');
    console.log('   🌅 Breakfast:  10 items  (₹65 – ₹110)');
    console.log('   ☀️  Lunch:      10 items  (₹100 – ₹230)');
    console.log('   🌙 Dinner:     10 items  (₹45 – ₹320)');
    console.log('   🍮 Sweets:      5 items  (₹65 – ₹90)');
    console.log('   ☕ Beverages:   5 items  (₹40 – ₹90)');
    console.log('   🍟 Snacks:     10 items  (₹40 – ₹220)');
    console.log('\n🚀 Restart your backend server and refresh the menu!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedMenuItems();