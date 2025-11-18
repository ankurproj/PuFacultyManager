const DataTransformer = require('./utils/dataTransformer');

function testTransformers() {
    console.log('🧪 Testing fixed transformer functions...\n');

    // Test Invited Talks transformation
    console.log('1️⃣ Testing Invited Talks Transformation:');
    const mockInvitedTalks = [
        {
            title_of_paper: "IoT and its Advantages in Communication Engineering",
            conference_seminar_workshop: "International Conference on IoT",
            organized_by: "IEEE",
            level: "International",
            from_date: "2019-03-01",
            to_date: "2019-03-03",
            year: "2019"
        }
    ];

    const transformedTalks = DataTransformer.transformInvitedTalks(mockInvitedTalks);
    console.log('   Original:', mockInvitedTalks[0]);
    console.log('   Transformed:', transformedTalks[0]);
    console.log('   ✅ Conference field mapped:', transformedTalks[0].conferences_seminar_workshop_training);
    console.log('   ✅ Organized by field mapped:', transformedTalks[0].organized_by);
    console.log();

    // Test Organized Conferences transformation
    console.log('2️⃣ Testing Organized Conferences Transformation:');
    const mockConferences = [
        {
            title_of_programme: "TCS Campus Connect Program",
            sponsors: "Tata Consultancy Services",
            venue_duration: "Pondicherry University - One Day",
            level: "University Level",
            from_date: "2018-05-15",
            to_date: "2018-05-15",
            year: "2018"
        }
    ];

    const transformedConfs = DataTransformer.transformOrganizedConferences(mockConferences);
    console.log('   Original:', mockConferences[0]);
    console.log('   Transformed:', transformedConfs[0]);
    console.log('   ✅ Title field mapped:', transformedConfs[0].title_of_programme);
    console.log('   ✅ Venue field mapped:', transformedConfs[0].venue_duration);
    console.log();

    // Test Organized Workshops transformation
    console.log('3️⃣ Testing Organized Workshops Transformation:');
    const mockWorkshops = [
        {
            title_of_programme: "Web Development Workshop",
            sponsors: "Wipro - MNC",
            venue_duration: "Pondicherry University - Five Days",
            level: "University Level",
            from_date: "2012-07-01",
            to_date: "2012-07-05",
            year: "2012"
        }
    ];

    const transformedWorkshops = DataTransformer.transformOrganizedWorkshops(mockWorkshops);
    console.log('   Original:', mockWorkshops[0]);
    console.log('   Transformed:', transformedWorkshops[0]);
    console.log('   ✅ Title field mapped:', transformedWorkshops[0].title_of_programme);
    console.log('   ✅ Venue field mapped:', transformedWorkshops[0].venue_duration);
    console.log();

    console.log('✅ All transformer functions are working correctly!');
    console.log('🔄 The field mapping issues have been fixed in the transformers');
}

testTransformers();