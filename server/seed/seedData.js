require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../models/User');
const Student = require('../models/Student');
const Landlord = require('../models/Landlord');
const Admin = require('../models/Admin');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Lease = require('../models/Lease');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const Notification = require('../models/Notification');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Verification = require('../models/Verification');
const Favorite = require('../models/Favorite');
const TourPlan = require('../models/TourPlan');
const Issue = require('../models/Issue');
const SecurityLog = require('../models/SecurityLog');
const RentTracker = require('../models/RentTracker');
const Amenity = require('../models/Amenity');

const MONGODB_URI = process.env.MONGODB_URI;

// Sri Lankan property images (placeholder URLs)
const propertyImages = [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
    'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800',
    'https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=800',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
    'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800',
    'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800'
];

const amenitiesList = [
    // Room
    { name: 'Air Conditioning', category: 'room', icon: 'wind' },
    { name: 'Ceiling Fan', category: 'room', icon: 'fan' },
    { name: 'Attached Bathroom', category: 'room', icon: 'bath' },
    { name: 'Hot Water', category: 'room', icon: 'thermometer' },
    { name: 'Balcony', category: 'room', icon: 'maximize' },
    // Furniture
    { name: 'Bed', category: 'furniture', icon: 'bed-double' },
    { name: 'Wardrobe', category: 'furniture', icon: 'archive' },
    { name: 'Study Table', category: 'furniture', icon: 'square' },
    { name: 'Chair', category: 'furniture', icon: 'armchair' },
    { name: 'Bookshelf', category: 'furniture', icon: 'book-open' },
    // Kitchen
    { name: 'Kitchen Access', category: 'kitchen', icon: 'utensils' },
    { name: 'Refrigerator', category: 'kitchen', icon: 'refrigerator' },
    { name: 'Microwave', category: 'kitchen', icon: 'zap' },
    { name: 'Rice Cooker', category: 'kitchen', icon: 'cooking-pot' },
    // Safety
    { name: 'CCTV', category: 'safety', icon: 'camera' },
    { name: 'Security Guard', category: 'safety', icon: 'shield' },
    { name: 'Fire Extinguisher', category: 'safety', icon: 'flame' },
    // Facilities
    { name: 'WiFi', category: 'facilities', icon: 'wifi' },
    { name: 'Laundry', category: 'facilities', icon: 'shirt' },
    { name: 'Parking', category: 'facilities', icon: 'car' },
    { name: 'Cleaning Service', category: 'facilities', icon: 'sparkles' },
    { name: 'Generator Backup', category: 'facilities', icon: 'battery' }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        console.log('Clearing existing data...');
        await Promise.all([
            User.deleteMany({}),
            Student.deleteMany({}),
            Landlord.deleteMany({}),
            Admin.deleteMany({}),
            Property.deleteMany({}),
            Booking.deleteMany({}),
            Review.deleteMany({}),
            Lease.deleteMany({}),
            Payment.deleteMany({}),
            Subscription.deleteMany({}),
            Notification.deleteMany({}),
            Conversation.deleteMany({}),
            Message.deleteMany({}),
            Verification.deleteMany({}),
            Favorite.deleteMany({}),
            TourPlan.deleteMany({}),
            Issue.deleteMany({}),
            SecurityLog.deleteMany({}),
            RentTracker.deleteMany({}),
            Amenity.deleteMany({})
        ]);

        console.log('Creating amenities...');
        await Amenity.insertMany(amenitiesList);

        // Create Admin User
        console.log('Creating admin user...');
        const adminUser = await User.create({
            email: 'admin@finditmate.lk',
            password: 'admin123',
            name: 'System Admin',
            phone: '+94771234567',
            userType: 'admin',
            isVerified: true
        });

        await Admin.create({
            userId: adminUser._id,
            role: 'super_admin',
            permissions: ['manage_users', 'manage_properties', 'manage_payments', 'view_analytics', 'manage_reports', 'system_settings']
        });

        // Create Landlords
        console.log('Creating landlords...');
        const landlordData = [
            { name: 'Mr. Kamal Perera', email: 'kamal@gmail.com', phone: '+94771234568', businessName: 'Perera Properties', nic: '198812345678' },
            { name: 'Mrs. Nimalee Silva', email: 'nimalee@gmail.com', phone: '+94771234569', businessName: 'Silva Residences', nic: '199012345678' },
            { name: 'Mr. Ruwan Fernando', email: 'ruwan@gmail.com', phone: '+94771234570', businessName: 'Fernando Holdings', nic: '198512345678' }
        ];

        const landlords = [];
        for (const data of landlordData) {
            const user = await User.create({
                email: data.email,
                password: 'landlord123',
                name: data.name,
                phone: data.phone,
                nic: data.nic,
                userType: 'landlord',
                isVerified: true
            });

            const subscription = await Subscription.create({
                userId: user._id,
                plan: 'premium',
                type: 'landlord',
                price: 5000,
                features: ['Unlimited Properties', 'Advanced Analytics', 'Priority Listing', 'Featured Badge', 'Premium Support'],
                endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            });

            const landlord = await Landlord.create({
                userId: user._id,
                businessName: data.businessName,
                subscriptionId: subscription._id,
                totalViews: Math.floor(Math.random() * 1000),
                totalInquiries: Math.floor(Math.random() * 100)
            });

            landlords.push({ user, landlord });
        }

        // Create Students
        console.log('Creating students...');
        const studentData = [
            { name: 'Kavindi Perera', email: 'kavindi@student.edu.lk', phone: '+94771234571', university: 'University of Colombo', studentId: 'UOC2021001', nic: '200112345678' },
            { name: 'Tharindu Jayasekara', email: 'tharindu@student.edu.lk', phone: '+94771234572', university: 'University of Moratuwa', studentId: 'UOM2021002', nic: '200212345678' },
            { name: 'Sachini Fernando', email: 'sachini@student.edu.lk', phone: '+94771234573', university: 'UCSC', studentId: 'UCSC2021003', nic: '200312345678' },
            { name: 'Dilshan Wickramasinghe', email: 'dilshan@student.edu.lk', phone: '+94771234574', university: 'SLIIT', studentId: 'SLIIT2021004', nic: '200112345679' },
            { name: 'Amaya Rajapaksa', email: 'amaya@student.edu.lk', phone: '+94771234575', university: 'IIT', studentId: 'IIT2021005', nic: '200212345679' }
        ];

        const students = [];
        for (const data of studentData) {
            const user = await User.create({
                email: data.email,
                password: 'student123',
                name: data.name,
                phone: data.phone,
                nic: data.nic,
                userType: 'student',
                isVerified: true
            });

            const subscription = await Subscription.create({
                userId: user._id,
                plan: 'free',
                type: 'student',
                price: 0,
                features: ['Basic property Search', 'AI Chatbot with Session Memory', 'Tour Organizer (Manual Planning)']
            });

            const student = await Student.create({
                userId: user._id,
                university: data.university,
                studentId: data.studentId,
                course: 'Computer Science',
                yearOfStudy: Math.floor(Math.random() * 4) + 1,
                subscriptionId: subscription._id
            });

            students.push({ user, student });
        }

        // Create Properties
        console.log('Creating properties...');
        const propertyData = [
            {
                title: 'Modern Single Room - UCSC 5min Walk',
                description: 'Fully furnished single room with attached bathroom. Walking distance to UCSC. Quiet neighborhood ideal for students. WiFi included.',
                address: 'Reid Avenue, Colombo 07',
                city: 'Colombo',
                lat: 6.9024,
                lng: 79.8613,
                rent: 12000,
                deposit: 24000,
                type: 'single',
                capacity: 1,
                amenities: ['Air Conditioning', 'Attached Bathroom', 'WiFi', 'Study Table', 'Bed', 'Wardrobe'],
                nearbyUniversities: ['UCSC', 'University of Colombo'],
                utilitiesCost: 2000,
                foodCost: 15000,
                transportCost: 3000
            },
            {
                title: 'Shared Room for 2 - Near Moratuwa University',
                description: 'Spacious shared room for 2 students. 10 mins to UOM by bus. Kitchen access, laundry facilities.',
                address: 'Katubedda, Moratuwa',
                city: 'Moratuwa',
                lat: 6.7959,
                lng: 79.9015,
                rent: 8000,
                deposit: 16000,
                type: 'shared',
                capacity: 2,
                amenities: ['Ceiling Fan', 'Kitchen Access', 'Laundry', 'WiFi', 'Bed', 'Study Table'],
                nearbyUniversities: ['University of Moratuwa', 'SLIIT'],
                utilitiesCost: 1500,
                foodCost: 12000,
                transportCost: 2000
            },
            {
                title: 'Deluxe Studio Apartment - Colombo 03',
                description: 'Premium studio apartment with all modern amenities. Perfect for postgraduate students. 24/7 security.',
                address: 'Kollupitiya, Colombo 03',
                city: 'Colombo',
                lat: 6.9116,
                lng: 79.8481,
                rent: 35000,
                deposit: 70000,
                type: 'deluxe',
                capacity: 1,
                amenities: ['Air Conditioning', 'Hot Water', 'Kitchen Access', 'Refrigerator', 'CCTV', 'Security Guard', 'WiFi', 'Parking'],
                nearbyUniversities: ['University of Colombo', 'IIT'],
                utilitiesCost: 5000,
                foodCost: 20000,
                transportCost: 5000
            },
            {
                title: 'Budget Friendly Room - Maharagama',
                description: 'Affordable room for budget-conscious students. Bus stop nearby. Basic amenities included.',
                address: 'High Level Road, Maharagama',
                city: 'Maharagama',
                lat: 6.8462,
                lng: 79.9256,
                rent: 6500,
                deposit: 13000,
                type: 'standard',
                capacity: 1,
                amenities: ['Ceiling Fan', 'Bed', 'Chair', 'Kitchen Access'],
                nearbyUniversities: ['SLIIT', 'NSBM'],
                utilitiesCost: 1000,
                foodCost: 10000,
                transportCost: 4000
            },
            {
                title: 'Premium Suite - Bambalapitiya',
                description: 'Luxury accommodation with sea view. Includes meals. Ideal for international students.',
                address: 'Galle Road, Bambalapitiya',
                city: 'Colombo',
                lat: 6.8920,
                lng: 79.8546,
                rent: 45000,
                deposit: 90000,
                type: 'suite',
                capacity: 1,
                amenities: ['Air Conditioning', 'Hot Water', 'Balcony', 'Refrigerator', 'Microwave', 'CCTV', 'Security Guard', 'WiFi', 'Cleaning Service', 'Generator Backup'],
                nearbyUniversities: ['University of Colombo', 'IIT', 'APIIT'],
                utilitiesCost: 0,
                foodCost: 0,
                transportCost: 6000,
                mealsIncluded: true
            },
            {
                title: 'Girls Only Hostel - Nugegoda',
                description: 'Safe and secure accommodation exclusively for female students. Warden supervised. Home-cooked meals available.',
                address: 'Stanley Thilakaratne Mawatha, Nugegoda',
                city: 'Nugegoda',
                lat: 6.8729,
                lng: 79.8929,
                rent: 10000,
                deposit: 20000,
                type: 'hostel',
                capacity: 1,
                amenities: ['Ceiling Fan', 'Hot Water', 'Kitchen Access', 'Laundry', 'Security Guard', 'WiFi', 'CCTV'],
                nearbyUniversities: ['Open University', 'SLIIT'],
                utilitiesCost: 1500,
                foodCost: 12000,
                transportCost: 2500
            },
            {
                title: 'Twin Sharing Room - Wellawatte',
                description: 'Comfortable twin sharing room. Beach nearby. Good connectivity to universities.',
                address: 'Marine Drive, Wellawatte',
                city: 'Colombo',
                lat: 6.8741,
                lng: 79.8600,
                rent: 9000,
                deposit: 18000,
                type: 'shared',
                capacity: 2,
                amenities: ['Ceiling Fan', 'Attached Bathroom', 'Kitchen Access', 'WiFi', 'Bed', 'Wardrobe'],
                nearbyUniversities: ['University of Colombo', 'IIT'],
                utilitiesCost: 1800,
                foodCost: 12000,
                transportCost: 3000
            },
            {
                title: 'Air-Conditioned Room - Borella',
                description: 'Cool and comfortable AC room. 15 mins walk to Colombo University. Quiet environment.',
                address: 'Baseline Road, Borella',
                city: 'Colombo',
                lat: 6.9212,
                lng: 79.8751,
                rent: 18000,
                deposit: 36000,
                type: 'single',
                capacity: 1,
                amenities: ['Air Conditioning', 'Attached Bathroom', 'Hot Water', 'WiFi', 'Study Table', 'Bed', 'Wardrobe', 'Bookshelf'],
                nearbyUniversities: ['University of Colombo', 'NIBM'],
                utilitiesCost: 3000,
                foodCost: 15000,
                transportCost: 2000
            },
            {
                title: 'Annex for Students - Dehiwala',
                description: 'Independent annex with separate entrance. Kitchen and bathroom attached. Ideal for small group.',
                address: 'Galle Road, Dehiwala',
                city: 'Dehiwala',
                lat: 6.8500,
                lng: 79.8650,
                rent: 25000,
                deposit: 50000,
                type: 'apartment',
                capacity: 3,
                amenities: ['Ceiling Fan', 'Hot Water', 'Kitchen Access', 'Refrigerator', 'Rice Cooker', 'WiFi', 'Parking'],
                nearbyUniversities: ['University of Moratuwa', 'SLIIT'],
                utilitiesCost: 4000,
                foodCost: 15000,
                transportCost: 3500
            },
            {
                title: 'Furnished Room - Battaramulla',
                description: 'Newly furnished room in residential area. Close to IT parks. Good for working students.',
                address: 'Parliament Road, Battaramulla',
                city: 'Battaramulla',
                lat: 6.9002,
                lng: 79.9183,
                rent: 15000,
                deposit: 30000,
                type: 'single',
                capacity: 1,
                amenities: ['Air Conditioning', 'Attached Bathroom', 'WiFi', 'Study Table', 'Bed', 'Wardrobe', 'Parking'],
                nearbyUniversities: ['SLIIT', 'NSBM'],
                utilitiesCost: 2500,
                foodCost: 14000,
                transportCost: 3500
            }
        ];

        const properties = [];
        for (let i = 0; i < propertyData.length; i++) {
            const data = propertyData[i];
            const landlord = landlords[i % landlords.length];

            const property = await Property.create({
                landlordId: landlord.landlord._id,
                title: data.title,
                description: data.description,
                address: data.address,
                location: {
                    lat: data.lat,
                    lng: data.lng,
                    city: data.city,
                    nearbyUniversities: data.nearbyUniversities
                },
                rent: data.rent,
                deposit: data.deposit,
                type: data.type,
                capacity: data.capacity,
                amenities: data.amenities,
                images: [
                    { url: propertyImages[i], isPrimary: true, order: 0 },
                    { url: propertyImages[(i + 1) % 10], isPrimary: false, order: 1 }
                ],
                rating: 3.5 + Math.random() * 1.5,
                reviewCount: Math.floor(Math.random() * 20),
                status: 'active',
                isVerified: true,
                estimatedBudget: data.rent + data.utilitiesCost + data.foodCost + data.transportCost,
                utilitiesCost: data.utilitiesCost,
                foodCost: data.foodCost,
                transportCost: data.transportCost,
                mealsIncluded: data.mealsIncluded || false,
                views: Math.floor(Math.random() * 500),
                safetyScore: 7 + Math.floor(Math.random() * 3)
            });

            await Landlord.findByIdAndUpdate(landlord.landlord._id, {
                $push: { properties: property._id }
            });

            properties.push(property);
        }

        // Create Leases (for some students)
        console.log('Creating leases...');
        const leases = [];
        for (let i = 0; i < 3; i++) {
            const student = students[i];
            const property = properties[i];
            const landlord = landlords[i % landlords.length];

            const lease = await Lease.create({
                studentId: student.student._id,
                landlordId: landlord.landlord._id,
                propertyId: property._id,
                startDate: new Date(2024, 0, 1),
                endDate: new Date(2024, 11, 31),
                monthlyRent: property.rent,
                deposit: property.deposit,
                status: 'active',
                terms: 'Standard lease terms apply. 1 month notice required for termination.',
                rules: ['No loud music after 10 PM', 'No pets allowed', 'No subletting', 'Keep premises clean']
            });

            await Student.findByIdAndUpdate(student.student._id, {
                currentLeaseId: lease._id
            });

            leases.push(lease);
        }

        // Create Bookings
        console.log('Creating bookings...');
        for (let i = 0; i < 5; i++) {
            const student = students[i];
            const property = properties[(i + 3) % properties.length];
            const landlord = landlords[(i + 1) % landlords.length];

            await Booking.create({
                studentId: student.student._id,
                propertyId: property._id,
                landlordId: landlord.landlord._id,
                checkIn: new Date(2024, 2, 1 + i * 5),
                checkOut: new Date(2024, 11, 31),
                guests: 1,
                status: i < 3 ? 'confirmed' : 'pending',
                totalAmount: property.rent + property.deposit,
                guestName: student.user.name,
                guestEmail: student.user.email,
                guestPhone: student.user.phone
            });
        }

        // Create Reviews
        console.log('Creating reviews...');
        const reviewComments = [
            'Excellent place to stay! The landlord is very friendly and the room is exactly as described.',
            'Good value for money. Clean and well-maintained.',
            'Great location, close to university. Would recommend!',
            'Nice and quiet neighborhood. Perfect for studying.',
            'The room is spacious and has all amenities. Very satisfied!',
            'Affordable and comfortable. Good WiFi connection.',
            'Friendly landlord, always helpful. Good experience overall.',
            'Perfect for students. Safe area with good transport links.'
        ];

        for (let i = 0; i < 10; i++) {
            const student = students[i % students.length];
            const property = properties[i % properties.length];

            await Review.create({
                studentId: student.student._id,
                propertyId: property._id,
                landlordId: property.landlordId,
                rating: 3 + Math.floor(Math.random() * 3),
                comment: reviewComments[i % reviewComments.length],
                studentName: student.user.name,
                studentEmail: student.user.email,
                propertyName: property.title
            });
        }

        // Create Payments
        console.log('Creating payments...');
        for (const lease of leases) {
            for (let month = 0; month < 6; month++) {
                await Payment.create({
                    studentId: lease.studentId,
                    landlordId: lease.landlordId,
                    leaseId: lease._id,
                    type: 'rent',
                    amount: lease.monthlyRent,
                    status: 'completed',
                    paymentDate: new Date(2024, month, 5),
                    dueDate: new Date(2024, month, 10),
                    paymentMethod: 'bank_transfer',
                    description: `Rent for ${new Date(2024, month, 1).toLocaleString('default', { month: 'long' })} 2024`
                });

                await RentTracker.create({
                    leaseId: lease._id,
                    studentId: lease.studentId,
                    landlordId: lease.landlordId,
                    propertyId: lease.propertyId,
                    month: new Date(2024, month, 1),
                    amount: lease.monthlyRent,
                    dueDate: new Date(2024, month, 10),
                    paidDate: new Date(2024, month, 5),
                    status: 'paid'
                });
            }
        }

        // Create Conversations and Messages
        console.log('Creating conversations and messages...');
        for (let i = 0; i < 5; i++) {
            const student = students[i];
            const landlord = landlords[i % landlords.length];
            const property = properties[i];

            const conversation = await Conversation.create({
                participants: [student.user._id, landlord.user._id],
                propertyId: property._id,
                studentName: student.user.name,
                landlordName: landlord.user.name,
                lastMessage: 'Thank you for your inquiry!',
                lastMessageTime: new Date()
            });

            const messages = [
                { senderId: student.user._id, content: `Hi, I'm interested in your property "${property.title}". Is it still available?`, role: 'student' },
                { senderId: landlord.user._id, content: 'Hello! Yes, the room is available. Would you like to schedule a visit?', role: 'landlord' },
                { senderId: student.user._id, content: 'Yes please! I can come this Saturday afternoon.', role: 'student' },
                { senderId: landlord.user._id, content: 'Perfect! Saturday 2 PM works for me. I\'ll send you the exact location.', role: 'landlord' },
                { senderId: student.user._id, content: 'Thank you! Looking forward to it.', role: 'student' },
                { senderId: landlord.user._id, content: 'Thank you for your inquiry!', role: 'landlord' }
            ];

            for (const msg of messages) {
                await Message.create({
                    conversationId: conversation._id,
                    senderId: msg.senderId,
                    senderName: msg.role === 'student' ? student.user.name : landlord.user.name,
                    content: msg.content,
                    role: msg.role,
                    isRead: true
                });
            }
        }

        // Create Notifications
        console.log('Creating notifications...');
        for (const { user } of students) {
            await Notification.create({
                userId: user._id,
                type: 'system',
                title: 'Welcome to FindItMate!',
                message: 'Start exploring properties and find your perfect accommodation.',
                isRead: false
            });
        }

        for (const { user } of landlords) {
            await Notification.create({
                userId: user._id,
                type: 'system',
                title: 'Welcome to FindItMate!',
                message: 'Manage your properties and connect with students looking for accommodation.',
                isRead: false
            });
        }

        // Create Security Logs
        console.log('Creating security logs...');
        const logActions = ['User Login', 'Property Listed', 'Booking Created', 'Profile Updated', 'Password Changed'];
        for (let i = 0; i < 20; i++) {
            const user = i < 10 ? students[i % 5].user : landlords[i % 3].user;
            await SecurityLog.create({
                userId: user._id,
                userEmail: user.email,
                action: logActions[i % logActions.length],
                severity: i % 5 === 0 ? 'warning' : 'info',
                ip: `192.168.1.${100 + i}`
            });
        }

        // Create Favorites
        console.log('Creating favorites...');
        for (let i = 0; i < students.length; i++) {
            const student = students[i];
            for (let j = 0; j < 3; j++) {
                const propertyIndex = (i + j) % properties.length;
                await Favorite.create({
                    studentId: student.student._id,
                    userId: student.user._id,
                    propertyId: properties[propertyIndex]._id
                });
                await Student.findByIdAndUpdate(student.student._id, {
                    $push: { favorites: properties[propertyIndex]._id }
                });
            }
        }

        // Create Tour Plans
        console.log('Creating tour plans...');
        for (let i = 0; i < 3; i++) {
            const student = students[i];
            const tourPlan = await TourPlan.create({
                studentId: student.student._id,
                userId: student.user._id,
                name: `Tour Plan ${i + 1}`,
                properties: [properties[i]._id, properties[(i + 1) % properties.length]._id],
                scheduledDate: new Date(2024, 2, 15 + i * 7),
                notes: 'Want to compare these properties',
                status: 'scheduled'
            });
            await Student.findByIdAndUpdate(student.student._id, {
                $push: { tourPlans: tourPlan._id }
            });
        }

        // Create Issues
        console.log('Creating issues...');
        await Issue.create({
            reporterId: students[0].user._id,
            propertyId: properties[0]._id,
            leaseId: leases[0]._id,
            type: 'maintenance',
            priority: 'medium',
            title: 'AC not cooling properly',
            description: 'The air conditioner is running but not cooling the room effectively.',
            status: 'in_progress'
        });

        await Issue.create({
            reporterId: students[1].user._id,
            propertyId: properties[1]._id,
            type: 'complaint',
            priority: 'low',
            title: 'WiFi speed is slow',
            description: 'The internet connection has been slow for the past few days.',
            status: 'pending'
        });

        console.log('\n========================================');
        console.log('Database seeded successfully!');
        console.log('========================================\n');
        console.log('Test Accounts:');
        console.log('----------------------------------------');
        console.log('Admin:    admin@finditmate.lk / admin123');
        console.log('Landlord: kamal@gmail.com / landlord123');
        console.log('Student:  kavindi@student.edu.lk / student123');
        console.log('----------------------------------------\n');

        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedDatabase();
