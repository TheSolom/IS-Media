import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';

const host = process.env.MYSQL_HOST || 'localhost';
const port = Number(process.env.MYSQL_PORT) || 3306;
const user = process.env.MYSQL_USER || 'root';
const password = process.env.MYSQL_ROOT_PASSWORD;
const database = process.env.MYSQL_DATABASE || 'is_media';

console.log(`🌱 Connecting to database '${database}' at ${host}:${port}...`);

const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    multipleStatements: true,
});

try {
    const hashedPassword = await bcrypt.hash('Demo1234!', 10);
    const now = Date.now();
    const hoursAgo = (h) => new Date(now - h * 3600 * 1000);
    const hoursFromNow = (h) => new Date(now + h * 3600 * 1000);

    // ==========================================
    // 1. Seed / Upsert Users
    // ==========================================
    console.log('Seeding demo and sample users...');
    const users = [
        {
            username: 'demo_user',
            email: 'demo@ismedia.com',
            firstname: 'Guest',
            lastname: 'User',
            password: hashedPassword,
            birth_date: '1998-05-15',
            gender: 'male',
            about: 'Guest explorer account testing IS-Media social platform.',
            profile_picture:
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            cover_picture:
                'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
            lives_in: 'San Francisco, CA',
            works_at: 'IS-Media Explorer',
            relationship: 'Single',
            is_verified: 1,
        },
        {
            username: 'alex_rivers',
            email: 'alex@example.com',
            firstname: 'Alex',
            lastname: 'Rivers',
            password: hashedPassword,
            birth_date: '1995-08-22',
            gender: 'male',
            about: 'Landscape photographer & coffee enthusiast ☕📸',
            profile_picture:
                'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
            cover_picture:
                'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
            lives_in: 'Seattle, WA',
            works_at: 'Rivers Studio',
            relationship: 'In a relationship',
            is_verified: 1,
        },
        {
            username: 'sarah_connor',
            email: 'sarah@example.com',
            firstname: 'Sarah',
            lastname: 'Connor',
            password: hashedPassword,
            birth_date: '1997-03-10',
            gender: 'female',
            about: 'Distributed systems engineer & ultra trail runner 🏔️💻',
            profile_picture:
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
            cover_picture:
                'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
            lives_in: 'Denver, CO',
            works_at: 'CloudScale Systems',
            relationship: 'Single',
            is_verified: 1,
        },
        {
            username: 'elena_rostova',
            email: 'elena@example.com',
            firstname: 'Elena',
            lastname: 'Rostova',
            password: hashedPassword,
            birth_date: '1996-11-04',
            gender: 'female',
            about: 'Design Systems Lead crafting delightful micro-interactions 🎨✨',
            profile_picture:
                'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
            cover_picture:
                'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
            lives_in: 'London, UK',
            works_at: 'DesignCraft Lab',
            relationship: 'Married',
            is_verified: 1,
        },
        {
            username: 'david_kim',
            email: 'david@example.com',
            firstname: 'David',
            lastname: 'Kim',
            password: hashedPassword,
            birth_date: '1994-01-19',
            gender: 'male',
            about: 'Astrophysicist & deep-space imaging nerd 🚀🔭',
            profile_picture:
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
            cover_picture:
                'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
            lives_in: 'Pasadena, CA',
            works_at: 'Nova Aerospace',
            relationship: 'Single',
            is_verified: 1,
        },
        {
            username: 'maya_patel',
            email: 'maya@example.com',
            firstname: 'Maya',
            lastname: 'Patel',
            password: hashedPassword,
            birth_date: '1996-07-14',
            gender: 'female',
            about: 'AI researcher exploring local LLMs, matcha addict, bookworm 🍵📚',
            profile_picture:
                'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
            cover_picture:
                'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
            lives_in: 'Austin, TX',
            works_at: 'NeuroMatrix AI',
            relationship: 'In a relationship',
            is_verified: 1,
        },
        {
            username: 'marcus_vance',
            email: 'marcus@example.com',
            firstname: 'Marcus',
            lastname: 'Vance',
            password: hashedPassword,
            birth_date: '1993-04-02',
            gender: 'male',
            about: 'Architectural designer fascinated by modern concrete & light 🏛️📐',
            profile_picture:
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
            cover_picture:
                'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
            lives_in: 'Chicago, IL',
            works_at: 'Vance Architecture',
            relationship: 'Single',
            is_verified: 1,
        },
        {
            username: 'chloe_dupont',
            email: 'chloe@example.com',
            firstname: 'Chloe',
            lastname: 'Dupont',
            password: hashedPassword,
            birth_date: '1998-09-30',
            gender: 'female',
            about: 'Pastry chef & food blogger sharing sourdough secrets 🥐🥖',
            profile_picture:
                'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
            cover_picture:
                'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
            lives_in: 'Paris, France',
            works_at: 'Atelier Dupont',
            relationship: 'In a relationship',
            is_verified: 1,
        },
        {
            username: 'jordan_lee',
            email: 'jordan@example.com',
            firstname: 'Jordan',
            lastname: 'Lee',
            password: hashedPassword,
            birth_date: '1995-12-18',
            gender: 'male',
            about: 'Indie game developer & synthwave sound designer 🕹️🎵',
            profile_picture:
                'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
            cover_picture:
                'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
            lives_in: 'Toronto, Canada',
            works_at: 'PixelCraft Games',
            relationship: 'Single',
            is_verified: 1,
        },
        {
            username: 'samira_khan',
            email: 'samira@example.com',
            firstname: 'Samira',
            lastname: 'Khan',
            password: hashedPassword,
            birth_date: '1997-06-25',
            gender: 'female',
            about: 'Marine biologist & ocean conservation filmmaker 🌊🐋',
            profile_picture:
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            cover_picture:
                'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=80',
            lives_in: 'Sydney, Australia',
            works_at: 'Oceanic Research Initiative',
            relationship: 'Married',
            is_verified: 1,
        },
    ];

    const userRows = users.map((u) => [
        u.username,
        u.email,
        u.firstname,
        u.lastname,
        u.password,
        u.birth_date,
        u.gender,
        u.about,
        u.profile_picture,
        u.cover_picture,
        u.lives_in,
        u.works_at,
        u.relationship,
        u.is_verified,
    ]);

    await connection.query(
        `INSERT INTO users (username, email, firstname, lastname, password, birth_date, gender, about, profile_picture, cover_picture, lives_in, works_at, relationship, is_verified)
         VALUES ?
         ON DUPLICATE KEY UPDATE
            firstname = VALUES(firstname),
            lastname = VALUES(lastname),
            about = VALUES(about),
            profile_picture = VALUES(profile_picture),
            cover_picture = VALUES(cover_picture),
            lives_in = VALUES(lives_in),
            works_at = VALUES(works_at),
            relationship = VALUES(relationship),
            is_verified = VALUES(is_verified)`,
        [userRows],
    );

    const usernames = users.map((u) => u.username);
    const [existingUsers] = await connection.query(
        'SELECT id, username FROM users WHERE username IN (?)',
        [usernames],
    );
    const userMap = Object.fromEntries(existingUsers.map((u) => [u.username, u.id]));

    const demoId = userMap['demo_user'];
    const alexId = userMap['alex_rivers'];
    const sarahId = userMap['sarah_connor'];
    const elenaId = userMap['elena_rostova'];
    const davidId = userMap['david_kim'];
    const mayaId = userMap['maya_patel'];
    const marcusId = userMap['marcus_vance'];
    const chloeId = userMap['chloe_dupont'];
    const jordanId = userMap['jordan_lee'];
    const samiraId = userMap['samira_khan'];

    // ==========================================
    // 2. Seed Followers Network
    // ==========================================
    console.log('Seeding followers network...');
    const followerPairs = [
        // Demo user follows:
        [alexId, demoId],
        [sarahId, demoId],
        [elenaId, demoId],
        [mayaId, demoId],
        [marcusId, demoId],
        // Follow demo user:
        [demoId, alexId],
        [demoId, sarahId],
        [demoId, elenaId],
        [demoId, davidId],
        [demoId, marcusId],
        [demoId, chloeId],
        // Community inter-connections:
        [sarahId, alexId],
        [alexId, sarahId],
        [elenaId, marcusId],
        [marcusId, elenaId],
        [davidId, mayaId],
        [mayaId, davidId],
        [jordanId, alexId],
        [chloeId, elenaId],
        [samiraId, sarahId],
        [samiraId, alexId],
        [mayaId, sarahId],
        [marcusId, alexId],
    ];
    await connection.query('INSERT IGNORE INTO user_followers (user_id, follower_id) VALUES ?', [
        followerPairs,
    ]);

    // ==========================================
    // 3. Seed Tags
    // ==========================================
    console.log('Seeding tags...');
    const tagNames = [
        'nature',
        'coding',
        'photography',
        'travel',
        'design',
        'lifestyle',
        'tech',
        'science',
        'foodie',
        'art',
        'gaming',
        'fitness',
        'music',
        'books',
    ];
    const tagRows = tagNames.map((t) => [t]);
    await connection.query('INSERT IGNORE INTO tags (tag) VALUES ?', [tagRows]);

    const [existingTags] = await connection.query('SELECT id, tag FROM tags WHERE tag IN (?)', [
        tagNames,
    ]);
    const tagMap = Object.fromEntries(existingTags.map((t) => [t.tag, t.id]));

    // ==========================================
    // 4. Seed Dynamic Posts with Staggered Timestamps
    // ==========================================
    console.log('Seeding dynamic posts...');
    const postsData = [
        {
            author_id: alexId,
            title: 'Weekend vibes in the Pacific Northwest',
            content:
                'Spent the weekend hiking through Olympic National Park. The fog and lush green moss here never get old. Always bring a camera! 🌲📷',
            image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80',
            tags: ['nature', 'photography', 'travel'],
            created_at: hoursAgo(2),
        },
        {
            author_id: sarahId,
            title: 'Building clean and reliable software',
            content:
                'Refactored our core message broker today. Remember: simplicity is a prerequisite for reliability! 💻✨ Less code, clearer boundaries, fewer edge cases.',
            image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
            tags: ['coding', 'tech'],
            created_at: hoursAgo(6),
        },
        {
            author_id: elenaId,
            title: 'Morning creative routine',
            content:
                'Warm latte, sketchbook, and fresh morning light. What does your creative morning routine look like? 🎨☕',
            image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
            tags: ['design', 'lifestyle', 'art'],
            created_at: hoursAgo(14),
        },
        {
            author_id: mayaId,
            title: 'Fine-tuning Local LLMs on Custom Datasets',
            content:
                'Testing 4-bit quantized open-source weights locally on a single workstation. The ergonomics and privacy of local AI models have improved dramatically over the last year! 🤖🧠',
            image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
            tags: ['tech', 'coding', 'science'],
            created_at: hoursAgo(24),
        },
        {
            author_id: davidId,
            title: 'Star gazing under desert skies',
            content:
                'Captured the Milky Way core last night outside Joshua Tree. Space never ceases to amaze me. 🌌🔭 Three hours of exposure stacking revealed stunning dust lanes.',
            image: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
            tags: ['photography', 'science', 'nature'],
            created_at: hoursAgo(48),
        },
        {
            author_id: chloeId,
            title: 'The Art of Wild Yeast Sourdough',
            content:
                '80% hydration, 36-hour cold ferment. That crispy blistered crust and open crumb make every hour of patience worth it! 🍞✨',
            image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=1200&q=80',
            tags: ['foodie', 'lifestyle'],
            created_at: hoursAgo(72),
        },
        {
            author_id: marcusId,
            title: 'Brutalist Geometry in Modern Architecture',
            content:
                'Raw textured concrete, bold cantilever overhangs, and interplay between direct sunlight and shadow. Architecture is frozen music. 🏛️📐',
            image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
            tags: ['design', 'art', 'photography'],
            created_at: hoursAgo(96),
        },
        {
            author_id: demoId,
            title: 'Welcome to IS-Media!',
            content:
                'Exploring the platform as a guest user. Feel free to like, comment, and test out creating new posts or chatting in real-time! 🚀🎉',
            image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
            tags: ['lifestyle', 'tech'],
            created_at: hoursAgo(120),
        },
        {
            author_id: jordanId,
            title: 'Designing Retro Chiptune & Synthwave Audio',
            content:
                'Working on the boss theme for our upcoming indie platformer. Combining authentic FM synthesis with modern tape saturation plugins! 🕹️🎧',
            image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
            tags: ['gaming', 'music', 'tech'],
            created_at: hoursAgo(144),
        },
        {
            author_id: samiraId,
            title: 'Great Barrier Reef Coral Conservation',
            content:
                'Diving with the marine restoration team this morning. Witnessing micro-fragmented coral colonies thriving in nursery zones gives us genuine hope for ocean biodiversity! 🌊🪸🐠',
            image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
            tags: ['nature', 'science', 'travel'],
            created_at: hoursAgo(168),
        },
        {
            author_id: sarahId,
            title: 'High Altitude Trail Running in the Rockies',
            content:
                '14 miles, 3,200 ft of vertical climb, zero cell reception. The best way to recharge between sprints and sprint retrospectives! 🏔️🏃‍♀️',
            image: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1200&q=80',
            tags: ['fitness', 'nature', 'lifestyle'],
            created_at: hoursAgo(192),
        },
        {
            author_id: alexId,
            title: 'Rainy Street Reflections in Shinjuku',
            content:
                'Neon reflections on wet asphalt. Tokyo at midnight in the rain is every street photographer’s absolute dream scenario. 🌧️🏮',
            image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
            tags: ['photography', 'travel', 'art'],
            created_at: hoursAgo(216),
        },
        {
            author_id: elenaId,
            title: 'Design Tokens: Bridging Design and Code',
            content:
                'Semantic tokens empower engineering and design to share one cohesive language. Dark mode, density shifts, and brand themes become effortless! 🎨💻',
            image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80',
            tags: ['design', 'coding'],
            created_at: hoursAgo(240),
        },
        {
            author_id: davidId,
            title: 'James Webb Deep Field Analysis',
            content:
                'Looking back over 13 billion years into early cosmic dawn. Gravitational lensing revealing primordial galaxies never ceases to humble us. 🔭✨',
            image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80',
            tags: ['science', 'photography'],
            created_at: hoursAgo(264),
        },
    ];

    const postTitles = postsData.map((p) => p.title);
    const [existingSamplePosts] = await connection.query(
        'SELECT id, title FROM posts WHERE title IN (?)',
        [postTitles],
    );
    const existingPostMap = Object.fromEntries(existingSamplePosts.map((p) => [p.title, p.id]));

    const missingPosts = postsData.filter((p) => !existingPostMap[p.title]);
    if (missingPosts.length > 0) {
        const insertRows = missingPosts.map((p) => [
            p.author_id,
            p.title,
            p.content,
            p.image,
            p.created_at,
        ]);
        await connection.query(
            'INSERT INTO posts (author_id, title, content, image, created_at) VALUES ?',
            [insertRows],
        );
    }

    const [allSamplePosts] = await connection.query(
        'SELECT id, title FROM posts WHERE title IN (?)',
        [postTitles],
    );
    const postMap = Object.fromEntries(allSamplePosts.map((p) => [p.title, p.id]));

    // ==========================================
    // 5. Seed Post Tags
    // ==========================================
    console.log('Seeding post tags...');
    const postTagRows = [];
    postsData.forEach((p) => {
        const postId = postMap[p.title];
        if (postId) {
            p.tags.forEach((t) => {
                const tagId = tagMap[t];
                if (tagId) postTagRows.push([postId, tagId]);
            });
        }
    });
    if (postTagRows.length > 0) {
        await connection.query('INSERT IGNORE INTO post_tags (post_id, tag_id) VALUES ?', [
            postTagRows,
        ]);
    }

    // ==========================================
    // 6. Seed Dynamic Likes & Comments
    // ==========================================
    console.log('Seeding likes and comments...');
    const allPostIds = Object.values(postMap);
    const allUserIds = [
        alexId,
        sarahId,
        elenaId,
        davidId,
        mayaId,
        marcusId,
        chloeId,
        jordanId,
        samiraId,
        demoId,
    ];

    // Build dynamic likes across posts
    const dynamicLikes = [];
    allPostIds.forEach((pId, idx) => {
        // Distribute 4-6 likes per post from different users
        const likers = [
            allUserIds[idx % allUserIds.length],
            allUserIds[(idx + 2) % allUserIds.length],
            allUserIds[(idx + 4) % allUserIds.length],
            allUserIds[(idx + 6) % allUserIds.length],
            demoId, // Demo user likes posts
        ];
        new Set(likers).forEach((uId) => dynamicLikes.push([pId, uId]));
    });

    await connection.query('INSERT IGNORE INTO post_likes (post_id, user_id) VALUES ?', [
        dynamicLikes,
    ]);

    // Conversational comments mapped to post titles
    const commentsBlueprint = [
        {
            title: 'Weekend vibes in the Pacific Northwest',
            comments: [
                [sarahId, 'Stunning shot Alex! Which trail did you take?'],
                [elenaId, 'The fog and moss look straight out of a fantasy novel! ✨'],
                [demoId, 'Adding Olympic National Park to my hiking bucket list!'],
            ],
        },
        {
            title: 'Building clean and reliable software',
            comments: [
                [davidId, 'Simplicity always wins in production. Great philosophy.'],
                [mayaId, 'Clean abstractions save so much debugging time!'],
                [demoId, 'Great reminder Sarah, clean architecture makes all the difference.'],
            ],
        },
        {
            title: 'Morning creative routine',
            comments: [
                [marcusId, 'Love the natural lighting on your desk setup.'],
                [chloeId, 'Coffee and creative work is the best combination ☕🎨'],
            ],
        },
        {
            title: 'Fine-tuning Local LLMs on Custom Datasets',
            comments: [
                [sarahId, 'What was your average tokens-per-second on the 4-bit quant?'],
                [davidId, 'Running models locally is such a huge leap for data privacy.'],
                [jordanId, 'Could be amazing for procedural dialogue generation!'],
            ],
        },
        {
            title: 'Star gazing under desert skies',
            comments: [
                [samiraId, 'The dust lane definition is unreal David!'],
                [jordanId, 'Cosmic inspiration for tonight’s ambient track 🚀'],
            ],
        },
        {
            title: 'The Art of Wild Yeast Sourdough',
            comments: [
                [alexId, 'That golden blistered crust looks delicious Chloe! Recipe please?'],
                [sarahId, '10/10 would devour immediately with some salted butter 🥐'],
            ],
        },
        {
            title: 'Brutalist Geometry in Modern Architecture',
            comments: [
                [elenaId, 'The balance of concrete texture and sunlight is captivating.'],
                [samiraId, 'Incredible framing Marcus!'],
            ],
        },
        {
            title: 'Welcome to IS-Media!',
            comments: [
                [alexId, 'Welcome to the platform! Let us know if you need any recommendations.'],
                [elenaId, 'Welcome to the community! Enjoy testing IS-Media! 🎉'],
                [sarahId, 'Happy testing! Feel free to create posts and explore.'],
                [mayaId, 'Welcome! Glad to have you exploring the feed.'],
            ],
        },
        {
            title: 'Designing Retro Chiptune & Synthwave Audio',
            comments: [
                [alexId, 'Getting major 80s arcade nostalgia from this preview!'],
                [mayaId, 'That analog synth bassline hits so well.'],
            ],
        },
        {
            title: 'Great Barrier Reef Coral Conservation',
            comments: [
                [marcusId, 'Vital conservation work. Thank you for protecting our oceans!'],
                [chloeId, 'Those underwater reef colors are breathtaking.'],
            ],
        },
    ];

    const plannedComments = [];
    commentsBlueprint.forEach(({ title, comments }) => {
        const postId = postMap[title];
        if (postId) {
            comments.forEach(([authorId, text]) => {
                plannedComments.push([postId, authorId, text]);
            });
        }
    });

    const [existingComments] = await connection.query(
        'SELECT post_id, author_id, content FROM post_comments WHERE post_id IN (?)',
        [allPostIds],
    );
    const existingCommentKeys = new Set(
        existingComments.map((c) => `${c.post_id}_${c.author_id}_${c.content}`),
    );
    const missingComments = plannedComments.filter(
        ([pId, aId, text]) => !existingCommentKeys.has(`${pId}_${aId}_${text}`),
    );

    if (missingComments.length > 0) {
        await connection.query('INSERT INTO post_comments (post_id, author_id, content) VALUES ?', [
            missingComments,
        ]);
    }

    // ==========================================
    // 7. Seed Active Stories
    // ==========================================
    console.log('Seeding stories...');
    const storyCandidates = [
        {
            author_id: alexId,
            content:
                'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80',
            hours: 18,
        },
        {
            author_id: sarahId,
            content:
                'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
            hours: 16,
        },
        {
            author_id: elenaId,
            content:
                'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
            hours: 22,
        },
        {
            author_id: chloeId,
            content:
                'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
            hours: 14,
        },
        {
            author_id: samiraId,
            content:
                'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=600&q=80',
            hours: 20,
        },
    ];

    const storyAuthorIds = storyCandidates.map((s) => s.author_id);
    const [existingStories] = await connection.query(
        'SELECT id, author_id FROM stories WHERE author_id IN (?) AND deleted_at > NOW()',
        [storyAuthorIds],
    );
    const authorsWithActiveStories = new Set(existingStories.map((s) => s.author_id));

    const missingStories = storyCandidates
        .filter((s) => !authorsWithActiveStories.has(s.author_id))
        .map((s) => [s.author_id, s.content, hoursFromNow(s.hours)]);

    if (missingStories.length > 0) {
        await connection.query('INSERT INTO stories (author_id, content, deleted_at) VALUES ?', [
            missingStories,
        ]);
    }

    // ==========================================
    // 8. Seed Direct & Group Conversations
    // ==========================================
    console.log('Checking direct & group conversations...');

    // Conv 1: Sarah 1-on-1 (Direct)
    const [existingConv1] = await connection.query(
        `SELECT c.id FROM conversations c
         JOIN conversation_participants p1 ON c.id = p1.conversation_id AND p1.user_id = ?
         JOIN conversation_participants p2 ON c.id = p2.conversation_id AND p2.user_id = ?
         WHERE c.type = 1 LIMIT 1`,
        [demoId, sarahId],
    );

    if (existingConv1.length === 0) {
        const [c1] = await connection.query(
            'INSERT INTO conversations (type, creator_id) VALUES (1, ?)',
            [sarahId],
        );
        const c1Id = c1.insertId;
        await connection.query(
            'INSERT INTO conversation_participants (conversation_id, user_id) VALUES ?',
            [
                [
                    [c1Id, demoId],
                    [c1Id, sarahId],
                ],
            ],
        );
        await connection.query(
            'INSERT INTO messages (conversation_id, sender_id, content) VALUES ?',
            [
                [
                    [
                        c1Id,
                        sarahId,
                        'Hey there! Welcome to IS-Media. Let me know if you have any questions!',
                    ],
                    [c1Id, demoId, 'Thanks Sarah! The platform is looking great.'],
                    [c1Id, sarahId, 'Awesome! Try testing creating a post or exploring the feed.'],
                ],
            ],
        );
    }

    // Conv 2: Alex 1-on-1 (Direct)
    const [existingConv2] = await connection.query(
        `SELECT c.id FROM conversations c
         JOIN conversation_participants p1 ON c.id = p1.conversation_id AND p1.user_id = ?
         JOIN conversation_participants p2 ON c.id = p2.conversation_id AND p2.user_id = ?
         WHERE c.type = 1 LIMIT 1`,
        [demoId, alexId],
    );

    if (existingConv2.length === 0) {
        const [c2] = await connection.query(
            'INSERT INTO conversations (type, creator_id) VALUES (1, ?)',
            [alexId],
        );
        const c2Id = c2.insertId;
        await connection.query(
            'INSERT INTO conversation_participants (conversation_id, user_id) VALUES ?',
            [
                [
                    [c2Id, demoId],
                    [c2Id, alexId],
                ],
            ],
        );
        await connection.query(
            'INSERT INTO messages (conversation_id, sender_id, content) VALUES ?',
            [
                [
                    [
                        c2Id,
                        alexId,
                        'Hey! Saw your first post on the feed. Are you into photography or outdoors?',
                    ],
                    [c2Id, demoId, 'A bit of both! Your Olympic Park photos look incredible.'],
                    [
                        c2Id,
                        alexId,
                        'Appreciate it! You definitely have to visit the Pacific Northwest sometime.',
                    ],
                ],
            ],
        );
    }

    // Conv 3: Explorers Group Chat (Type 2: Group)
    const [existingConv3] = await connection.query(
        `SELECT c.id FROM conversations c WHERE c.title = ? AND c.type = 2 LIMIT 1`,
        ['Product Explorers 🚀'],
    );

    if (existingConv3.length === 0) {
        const [c3] = await connection.query(
            'INSERT INTO conversations (type, title, creator_id) VALUES (2, ?, ?)',
            ['Product Explorers 🚀', elenaId],
        );
        const c3Id = c3.insertId;
        await connection.query(
            'INSERT INTO conversation_participants (conversation_id, user_id) VALUES ?',
            [
                [
                    [c3Id, demoId],
                    [c3Id, sarahId],
                    [c3Id, alexId],
                    [c3Id, elenaId],
                ],
            ],
        );
        await connection.query(
            'INSERT INTO messages (conversation_id, sender_id, content) VALUES ?',
            [
                [
                    [c3Id, elenaId, 'Welcome everyone to the early explorer group! 🎉'],
                    [c3Id, alexId, 'Excited to test out media sharing and real-time messaging.'],
                    [c3Id, sarahId, 'Everything is connected to WebSockets and ready to roll.'],
                    [c3Id, demoId, 'Glad to be here with the team!'],
                ],
            ],
        );
    }

    console.log('\n✅ Database seeded successfully with dynamic data!');
    console.log(`- Demo account: demo_user (demo@ismedia.com)`);
    console.log(`- 10 sample profiles across diverse professions and locations.`);
    console.log(`- 14 rich posts with staggered chronological timestamps and tags.`);
    console.log(`- Interconnected follower network, multi-user comments & likes.`);
    console.log(`- Active expiring stories and direct + group chat conversations.`);
    console.log(`- Existing dummy & semi-real data preserved intact.`);
} catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
} finally {
    await connection.end();
}
