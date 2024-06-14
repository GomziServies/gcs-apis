// You can add common or constant here

module.exports.common_environment = {
    development: 'development',
    production: 'production',
}

module.exports.adminType = {
    master: 'MASTER',
    admin: 'Admin',
}

module.exports.userStatus = {
    active: 'ACTIVE', // Active User
    deleted: 'DELETED', // Deleted by user itself or Admin
    deactivate: 'DEACTIVATED' // Deactivate by Admin or User itself
}

module.exports.MFAMethods = {
    authenticator: 'authenticator',
}

module.exports.gender = {
    male: 'MALE',
    female: 'FEMALE',
    other: 'OTHER'
}

module.exports.userType = {
    admin: 'ADMIN',
    user: 'USER',
}

module.exports.status = {
    active: 'ACTIVE',
    deleted: 'DELETED',
    pending: 'PENDING',
    inactive: 'INACTIVE'
}

module.exports.fileType = {
    audio: 'AUDIO',
    file: 'FILE',
}

module.exports.goal = {
    fat_loss: 'FAT LOSS',
    muscle_gain: 'MUSCLE GAIN'
}

module.exports.weekdays = {
    monday: 'MONDAY',
    tuesday: 'TUESDAY',
    wednesday: 'WEDNESDAY',
    thursday: 'THURSDAY',
    friday: 'FRIDAY',
    saturday: 'SATURDAY',
    sunday: 'SUNDAY'
}

module.exports.purchaseMode = {
    online: 'ONLINE', // Purchase by User - Using Online Web Service
    manual: 'MANUAL', // Added by Admin
}

module.exports.paymentGateway = {
    razorpay: 'RAZORPAY', // Registered Email: fitnesswithgomzi@gmail.com
    razorpay_fgiit: 'RAZORPAY_FGIIT', // Registered Email: fgiitsurat@gmail.com
    razorpay_fgmeals: 'RAZORPAY_FGMEALS', // Registered Email: fgmeals.surat@gmail.com
}

module.exports.orderStatus = {
    success: 'SUCCESS', // After Successful Payment
    pending: 'PENDING', // Before Successful Payment
    failed: 'FAILED', // Failed due to not paid for long time
    cancelled: 'CANCELLED', // Cancelled by user
    refunded: 'REFUNDED', // Refunded by admin
}

module.exports.itemType = {
    meals: 'FG_MEAL_PRODUCT', // Ref.: FG Meals Product
    pt_plan: 'PT_PLAN', // Ref.: FWG > PT Plan
    fitness_course: 'FITNESS_COURSE', // Ref.: FG IIT > Fitness Course,
    digital_plan: 'DIGITAL_PLAN', // Ref.: FG Digital > Digital Plan
    books: 'BOOKS', // Ref.: Books [FGIIT]
    ebooks: 'EBOOKS', // Ref.: E-Books [FGIIT]
}

module.exports.userService = {
    meals: 'FG-MEALS',
    digital: 'FG-DIGITAL',
    fgiit: 'FGIIT',
    fitness: 'FWG',
    businessListing: 'BUSINESS-LISTING',
}

module.exports.timeUnit = {
    day: 'DAY',
    week: 'WEEK',
    month: 'MONTH',
    year: 'YEAR'
}

module.exports.otpViaCode = {
    mobileVerification: 'MOBILE VERIFICATION',
    emailVerification: 'EMAIL VERIFICATION',
}

module.exports.shipmentStatus = {
    placed: 'PLACED',
    dispatched: 'DISPATCHED',
    delivered: 'DELIVERED',
    cancelled: 'CANCELLED',
    returned: 'RETURN',
}

module.exports.feedbackStatus = {
    pending: 'PENDING',
    approved: 'APPROVED',
    rejected: 'REJECTED'
}

module.exports.leaveStatus = {
    pending: 'PENDING',
    approved: 'APPROVED',
    rejected: 'REJECTED'
}

module.exports.taskStatus = {
    pending: 'PENDING',
    completed: 'COMPLETED',
    rejected: 'REJECTED'
}

module.exports.ActionTopic = {
    demoLecture: 'Demo Lecture',
    RTPSession: 'Demo RTP Session',
}

module.exports.projectSubmissionStatus = {
    submitted: 'Submitted',
    reassigned: 'Reassigned',
    rejected: 'Rejected',
    approved: 'Approved',
}

module.exports.examQuestionType = {
    mcq: 'MCQ'
}

module.exports.CourseCategory = {
    online: 'Online Course',
    offline: 'Offline Course',
    flexible: 'Flexible Learning'
}

module.exports.CourseCoachingMode = {
    virtual: 'VIRTUAL',
    physical: 'PHYSICAL',
}

module.exports.CertificateGenerateType = {
    auto: 'AUTO',
    manual: 'MANUAL',
}

const certificateRootDir = process.cwd() + '/src/templates/certificates';
const certificateCourses = {
    'CertifiedPersonalTrainer': "Certified Personal Trainer",
    'CertifiedDietitianCourse': "Certified Dietitian Course",
    'AnabolicAndrogenicSteroids': "Anabolic Androgenic Steroids",
    'TabataWorkshop': "Tabata Workshop",
    'InjuryRehabCourse': "Injury Rehab Course",
    'CertifiedWellnessConsultant': 'Certified Wellness Consultant',
    'DiplomaGymManagement': 'Diploma in Gym Management',
    'PythonProgramming': 'Python Programming',
    "GroupInstructorMasterclass": "Group Instructor Masterclass"
}
module.exports.certificateCourses = certificateCourses;

module.exports.certificateFiles = {
    [certificateCourses.CertifiedPersonalTrainer]: certificateRootDir + '/diploma-personal-training.jpg',
    [certificateCourses.CertifiedDietitianCourse]: certificateRootDir + '/diploma-nutritionist.jpg',
    [certificateCourses.AnabolicAndrogenicSteroids]: certificateRootDir + '/anabolic-androgenic-steroids.jpg',
    [certificateCourses.GroupInstructorMasterclass]: certificateRootDir + '/group-instructor-masterclass.jpg',
    [certificateCourses.InjuryRehabCourse]: certificateRootDir + '/injury-rehabilitation-masterclass.jpg',
    [certificateCourses.CertifiedWellnessConsultant]: certificateRootDir + '/certified-wellness-consultant.jpg',
    [certificateCourses.DiplomaGymManagement]: certificateRootDir + '/diploma-gym-management.jpg',
    [certificateCourses.PythonProgramming]: certificateRootDir + '/python-programming.jpg',
    [certificateCourses.TabataWorkshop]: certificateRootDir + '/TabataWorkshop.png',
}

module.exports.businessTypes = {
    personal: 'personal',
    business: 'business'
}

module.exports.contactType = {
    mobile: 'mobile',
    email: 'email',
    whatsapp: 'whatsapp',
    landline: 'landline',
    website: 'website',
}

module.exports.socialMediaTypes = {
    facebook: 'facebook',
    instagram: 'instagram',
    twitter: 'twitter',
    youtube: 'youtube',
    linkedin: 'linkedin',
    pinterest: 'pinterest',
    telegram: 'telegram',
    whatsapp: 'whatsapp',
    website: 'website',
}

module.exports.businessApprovalStatus = {
    pending: 'PENDING',
    approved: 'APPROVED',
    rejected: 'REJECTED',
    banned: 'BANNED'
}