const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');

// Configuration
const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'alumni_connect';

// Hardcoded Password for all users: 'password123'
const HASHED_PASSWORD = bcrypt.hashSync('password123', 10);

const DEPARTMENTS = ['Computer Science', 'Information Science', 'Electronics', 'Mechanical', 'Civil', 'Biotechnology'];
const ROLES = ['USER', 'ADMIN'];
const VERIFICATION_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'];

async function seed() {
    const client = new MongoClient(MONGO_URI);

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(DB_NAME);

        // Clear existing data
        console.log('Clearing existing data...');
        await db.collection('users').deleteMany({});
        await db.collection('posts').deleteMany({});
        await db.collection('events').deleteMany({});
        await db.collection('job_posts').deleteMany({});
        await db.collection('announcements').deleteMany({});

        // ----------------------------------------------------
        // 1. Create Users
        // ----------------------------------------------------
        console.log('Seeding Users...');

        const users = [];

        // Create 2 Admins
        for (let i = 0; i < 2; i++) {
            users.push(createUser(true));
        }

        // Create 20 Alumni/Students
        for (let i = 0; i < 20; i++) {
            users.push(createUser(false));
        }

        // Ensure at least one known admin and user for testing
        users[0].email = 'admin@dsce.edu.in';
        users[0].firstName = 'Admin';
        users[0].role = 'ADMIN';
        users[0].verificationStatus = 'APPROVED';

        users[2].email = 'user@dsce.edu.in';
        users[2].firstName = 'Test User';
        users[2].role = 'USER';
        users[2].verificationStatus = 'APPROVED';

        await db.collection('users').insertMany(users);
        console.log(`Inserted ${users.length} users`);

        // ----------------------------------------------------
        // 2. Create Posts
        // ----------------------------------------------------
        console.log('Seeding Posts...');
        const posts = [];
        const approvedUsers = users.filter(u => u.verificationStatus === 'APPROVED');

        for (let i = 0; i < 30; i++) {
            const author = faker.helpers.arrayElement(approvedUsers);
            posts.push({
                _id: new ObjectId(),
                authorId: author._id.toString(),
                authorName: `${author.firstName} ${author.lastName}`,
                authorAvatar: author.profilePicture,
                authorRole: author.jobTitle || 'Alumni',
                graduationYear: author.graduationYear,
                department: author.department,
                content: faker.lorem.paragraph(),
                createdAt: faker.date.recent({ days: 30 }),
                likes: faker.number.int({ min: 0, max: 50 }),
                comments: faker.number.int({ min: 0, max: 10 }),
                shares: faker.number.int({ min: 0, max: 5 }),
                media: Math.random() > 0.7 ? [faker.image.urlLoremFlickr({ category: 'tech' })] : [],
                hashtags: [faker.word.sample(), faker.word.sample()],
                mentions: [],
                likedBy: [],
                reportedBy: [],
                _class: "com.dsce.AlumniConnect.entity.Post"
            });
        }
        await db.collection('posts').insertMany(posts);
        console.log(`Inserted ${posts.length} posts`);

        // ----------------------------------------------------
        // 3. Create Events
        // ----------------------------------------------------
        console.log('Seeding Events...');
        const events = [];
        for (let i = 0; i < 5; i++) {
            const date = faker.date.future();
            events.push({
                _id: new ObjectId(),
                title: faker.company.catchPhrase(),
                time: "10:00 AM",
                day: date.getDate().toString(),
                month: date.toLocaleString('default', { month: 'short' }).toUpperCase(),
                starttime: "10:00",
                endtime: "12:00",
                location: faker.location.city(),
                description: faker.lorem.paragraph(),
                category: 'Meetup',
                maxParticipants: faker.number.int({ min: 50, max: 200 }).toString(),
                registrationDeadline: faker.date.future().toISOString(),
                virtualLink: faker.internet.url(),
                organizerName: 'DSCE Alumni Association',
                organizerContact: 'alumni@dsce.edu.in',
                eventDate: date,
                _class: "com.dsce.AlumniConnect.entity.Event"
            });
        }
        await db.collection('events').insertMany(events);
        console.log(`Inserted ${events.length} events`);

        // ----------------------------------------------------
        // 4. Create Jobs
        // ----------------------------------------------------
        console.log('Seeding Jobs...');
        const jobs = [];
        for (let i = 0; i < 8; i++) {
            const author = faker.helpers.arrayElement(approvedUsers);
            jobs.push({
                _id: new ObjectId(),
                title: faker.person.jobTitle(),
                company: faker.company.name(),
                location: faker.location.city(),
                type: faker.helpers.arrayElement(['Full-time', 'Internship', 'Remote']),
                description: faker.lorem.paragraphs(2),
                requirements: faker.lorem.lines(3),
                contactEmail: faker.internet.email(),
                applicationLink: faker.internet.url(),
                // postedByName Removed as it is not in entity
                postedById: author._id.toString(),
                postedBy: { $ref: 'users', $id: author._id },
                createdAt: faker.date.recent(),
                active: true,
                _class: "com.dsce.AlumniConnect.entity.JobPost"
            });
        }
        await db.collection('job_posts').insertMany(jobs);
        console.log(`Inserted ${jobs.length} jobs`);

    } catch (err) {
        console.error('Error seeding database:', err);
    } finally {
        await client.close();
        console.log('Database connection closed');
    }
}

function createUser(isAdmin) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const isAlumni = !isAdmin;

    return {
        _id: new ObjectId(),
        firstName: firstName,
        lastName: lastName,
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        password: HASHED_PASSWORD,
        role: isAdmin ? 'ADMIN' : 'USER',
        graduationYear: isAlumni ? faker.number.int({ min: 2010, max: 2024 }) : null,
        department: faker.helpers.arrayElement(DEPARTMENTS),
        profilePicture: faker.image.avatar(),
        bio: faker.person.bio(),
        linkedinProfile: `https://linkedin.com/in/${firstName}${lastName}`,
        contactNumber: faker.phone.number(),
        authProvider: 'LOCAL',
        createdAt: faker.date.past(),
        updatedAt: new Date(),
        profileComplete: true,
        location: faker.location.city(),
        skills: [faker.word.sample(), faker.word.sample(), faker.word.sample()],
        verificationStatus: isAdmin ? 'APPROVED' : faker.helpers.arrayElement(VERIFICATION_STATUSES),
        _class: "com.dsce.AlumniConnect.entity.User"
    };
}

seed();
