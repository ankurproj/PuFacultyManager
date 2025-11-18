/**
 * Test the profile update from scraped data API endpoint
 */

const mongoose = require('mongoose');
const express = require('express');
const FacultyDataScraper = require('./scrapers/facultyDataScraper');
const DataTransformer = require('./utils/dataTransformer');
const Professor = require('./Professor');

async function testProfileUpdateFromScrapedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://admin:Mk8921550964@cluster1.bp5bk.mongodb.net/CompScience');
    console.log('🔌 Connected to database');

    // Simulate the logged-in user (pondiuni.ac.in)
    const userId = '68d399a034fd1c8cf6f5ef47'; // skvjey@pondiuni.ac.in
    const nodeId = '941';

    console.log(`👤 Simulating profile update for user: ${userId}`);
    console.log(`🔗 Using node ID: ${nodeId}\n`);

    // Step 1: Get current user (before update)
    const currentUser = await Professor.findById(userId);
    if (!currentUser) {
      console.log('❌ Current user not found');
      return;
    }

    console.log(`📋 BEFORE UPDATE:`);
    console.log(`   Name: ${currentUser.name}`);
    console.log(`   Email: ${currentUser.email}`);
    console.log(`   Ongoing projects: ${currentUser.ongoing_projects?.length || 0}`);
    console.log(`   Completed projects: ${currentUser.completed_projects?.length || 0}`);
    console.log(`   Ongoing consultancy: ${currentUser.ongoing_consultancy_works?.length || 0}`);
    console.log(`   Completed consultancy: ${currentUser.completed_consultancy_works?.length || 0}\n`);

    // Step 2: Scrape the faculty data
    console.log('📡 Scraping faculty data...');
    const scraper = new FacultyDataScraper();
    const scrapedData = await scraper.scrapeFacultyData(nodeId);

    if (!scrapedData || !scrapedData.name) {
      console.log(`❌ No faculty data found for node ID ${nodeId}`);
      return;
    }

    console.log(`✅ Scraped data for: ${scrapedData.name} (${scrapedData.email})`);

    // Step 3: Transform the scraped data
    console.log('🔄 Transforming scraped data...');
    const transformedData = DataTransformer.transformScrapedDataForDB(scrapedData);

    console.log(`✅ Transformed data:`);
    console.log(`   Ongoing projects: ${transformedData.ongoing_projects?.length || 0}`);
    console.log(`   Completed projects: ${transformedData.completed_projects?.length || 0}`);
    console.log(`   Ongoing consultancy: ${transformedData.ongoing_consultancy_works?.length || 0}`);
    console.log(`   Completed consultancy: ${transformedData.completed_consultancy_works?.length || 0}\n`);

    // Step 4: Prepare update data (same as the API route)
    const updateData = {
      // Update profile information (preserve email and password)
      name: transformedData.name || currentUser.name,
      department: transformedData.department || currentUser.department,
      designation: transformedData.designation || currentUser.designation,

      // Projects and consultancy (THESE ARE THE KEY FIELDS)
      ongoing_projects: transformedData.ongoing_projects || [],
      completed_projects: transformedData.completed_projects || [],
      ongoing_consultancy_works: transformedData.ongoing_consultancy_works || [],
      completed_consultancy_works: transformedData.completed_consultancy_works || [],

      // Other fields...
      teaching_experience: transformedData.teaching_experience || [],
      research_experience: transformedData.research_experience || [],
      industry_experience: transformedData.industry_experience || [],
      ugc_papers: transformedData.ugc_papers || [],
      ugc_approved_journals: transformedData.ugc_approved_journals || [],
      non_ugc_papers: transformedData.non_ugc_papers || [],
      non_ugc_journals: transformedData.non_ugc_journals || [],
      conference_proceedings: transformedData.conference_proceedings || [],
      books: transformedData.books || [],
      chapters_in_books: transformedData.chapters_in_books || [],
      edited_books: transformedData.edited_books || [],
      education: transformedData.education || [],
      awards: transformedData.awards || [],
      patents: transformedData.patents || [],
      fellowship: transformedData.fellowship || [],
      training_programs: transformedData.training_programs || [],
      mou_collaborations: transformedData.mou_collaborations || [],
      area_of_expertise: transformedData.area_of_expertise || [],
      research_interests: transformedData.research_interests || [],

      // Meta information
      node_id: nodeId,
      data_source: currentUser.data_source === 'manual' ? 'hybrid' : 'web_scraping',
      last_scraped: new Date(),
    };

    console.log(`📦 Update data prepared:`);
    console.log(`   Ongoing projects to update: ${updateData.ongoing_projects?.length || 0}`);
    console.log(`   Completed projects to update: ${updateData.completed_projects?.length || 0}`);
    console.log(`   Ongoing consultancy to update: ${updateData.ongoing_consultancy_works?.length || 0}`);
    console.log(`   Completed consultancy to update: ${updateData.completed_consultancy_works?.length || 0}\n`);

    // Show first project details if available
    if (updateData.ongoing_projects?.length > 0) {
      console.log(`🔍 First ongoing project to be updated:`);
      const project = updateData.ongoing_projects[0];
      console.log(`   Title: "${project.title_of_project}"`);
      console.log(`   Sponsored by: "${project.sponsored_by}"`);
      console.log(`   Period: "${project.period}"`);
      console.log(`   Amount: "${project.sanctioned_amount}"`);
      console.log(`   Year: "${project.year}"\n`);
    }

    if (updateData.completed_consultancy_works?.length > 0) {
      console.log(`🔍 First completed consultancy to be updated:`);
      const consultancy = updateData.completed_consultancy_works[0];
      console.log(`   Title: "${consultancy.title_of_consultancy_work}"`);
      console.log(`   Sponsored by: "${consultancy.sponsored_by}"`);
      console.log(`   Period: "${consultancy.period}"`);
      console.log(`   Amount: "${consultancy.sanctioned_amount}"`);
      console.log(`   Year: "${consultancy.year}"\n`);
    }

    // Step 5: Update the current user with scraped data
    console.log('💾 Updating user profile...');
    const updatedUser = await Professor.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    console.log(`✅ Updated user: ${updatedUser.name}`);

    // Step 6: Verify the update
    console.log(`\n📋 AFTER UPDATE:`);
    console.log(`   Name: ${updatedUser.name}`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Ongoing projects: ${updatedUser.ongoing_projects?.length || 0}`);
    console.log(`   Completed projects: ${updatedUser.completed_projects?.length || 0}`);
    console.log(`   Ongoing consultancy: ${updatedUser.ongoing_consultancy_works?.length || 0}`);
    console.log(`   Completed consultancy: ${updatedUser.completed_consultancy_works?.length || 0}`);

    // Show actual data
    if (updatedUser.ongoing_projects?.length > 0) {
      console.log(`\n🔍 First ongoing project in database:`);
      const project = updatedUser.ongoing_projects[0];
      console.log(`   Title: "${project.title_of_project}"`);
      console.log(`   Sponsored by: "${project.sponsored_by}"`);
      console.log(`   Period: "${project.period}"`);
      console.log(`   Amount: "${project.sanctioned_amount}"`);
      console.log(`   Year: "${project.year}"`);
    }

    if (updatedUser.completed_consultancy_works?.length > 0) {
      console.log(`\n🔍 First completed consultancy in database:`);
      const consultancy = updatedUser.completed_consultancy_works[0];
      console.log(`   Title: "${consultancy.title_of_consultancy_work}"`);
      console.log(`   Sponsored by: "${consultancy.sponsored_by}"`);
      console.log(`   Period: "${consultancy.period}"`);
      console.log(`   Amount: "${consultancy.sanctioned_amount}"`);
      console.log(`   Year: "${consultancy.year}"`);
    }

    console.log(`\n✅ Profile update simulation completed!`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database disconnected');
  }
}

testProfileUpdateFromScrapedData();