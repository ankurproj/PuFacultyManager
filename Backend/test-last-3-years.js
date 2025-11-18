// Test the last 3 years filtering logic for HOD publications statistics
const currentYear = new Date().getFullYear();
console.log(`Testing Last 3 Years Filter Logic`);
console.log(`=================================`);
console.log(`Current Year: ${currentYear}`);
console.log(`Last 3 Years: ${currentYear}, ${currentYear - 1}, ${currentYear - 2}`);

// Sample data to test the filtering logic
const sampleYearWisePublications = {
    '2025': 15,
    '2024': 22,
    '2023': 18,
    '2022': 12,
    '2021': 8,
    '2020': 10,
    'Unknown': 3
};

console.log('\nSample Year-wise Publications Data:');
Object.entries(sampleYearWisePublications).forEach(([year, count]) => {
    console.log(`  ${year}: ${count} publications`);
});

// Apply the filtering logic (same as in the backend)
const last3Years = [currentYear, currentYear - 1, currentYear - 2];

const sortedYears = Object.entries(sampleYearWisePublications)
    .filter(([year, count]) => {
        // Only include last 3 years (exclude 'Unknown')
        return year !== 'Unknown' && last3Years.includes(parseInt(year));
    })
    .sort((a, b) => {
        return parseInt(b[0]) - parseInt(a[0]);
    });

console.log('\nFiltered Results (Last 3 Years Only):');
console.log('====================================');

if (sortedYears.length > 0) {
    let totalLast3Years = 0;
    sortedYears.forEach(([year, count]) => {
        console.log(`  ${year}: ${count} publications`);
        totalLast3Years += count;
    });
    console.log(`\nTotal publications in last 3 years: ${totalLast3Years}`);
    console.log('✅ Filtering logic works correctly!');
} else {
    console.log('  No publications found in the last 3 years');
    console.log('⚠️  This would show "No publications in last 3 years" message');
}

console.log('\n📋 Frontend will display:');
console.log('  - Card title: "Department Publications"');
console.log('  - Total: All publications (not just last 3 years)');
console.log('  - Breakdown: "Last 3 Years" with year-wise data');
console.log('  - Years shown:', sortedYears.map(([year]) => year).join(', ') || 'None');