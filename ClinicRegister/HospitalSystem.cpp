#include "HospitalSystem.h"
#include <iostream>
#include <fstream>
#include <unordered_map>

HospitalSystem::HospitalSystem() {
    loadData();
    if (patients.empty()) {
        registerPatient("P001", "John Doe", 45, "555-1234");
        registerPatient("P002", "Jane Smith", 30, "555-5678");
        registerPatient("P003", "Alice Johnson", 60, "555-8765");
    }
}

HospitalSystem::~HospitalSystem() {
    saveData();
}

void HospitalSystem::loadData() {
    std::ifstream pFile("patients.txt");
    if(pFile.is_open()) {
        std::string line;
        while(std::getline(pFile, line)) {
            if(!line.empty()) patients.push_back(Patient::fromString(line));
        }
        pFile.close();
    }

    std::ifstream vFile("visits.txt");
    if(vFile.is_open()) {
        std::string line;
        while(std::getline(vFile, line)) {
            if(!line.empty()) visits.push_back(Visit::fromString(line));
        }
        vFile.close();
    }
}

void HospitalSystem::saveData() const {
    std::ofstream pFile("patients.txt");
    for(const auto& p : patients) {
        pFile << p.toString() << "\n";
    }
    pFile.close();

    std::ofstream vFile("visits.txt");
    for(const auto& v : visits) {
        vFile << v.toString() << "\n";
    }
    vFile.close();
}

bool HospitalSystem::patientExists(const std::string& patientID) const {
    for(const auto& p : patients) {
        if(p.getPatientID() == patientID) return true;
    }
    return false;
}

void HospitalSystem::registerPatient(const std::string& id, const std::string& name, int age, const std::string& phone) {
    if(patientExists(id)) {
        std::cout << "Error: Patient ID already exists.\n";
        return;
    }
    patients.push_back(Patient(id, name, age, phone));
    std::cout << "Patient registered successfully.\n";
    saveData();
}

void HospitalSystem::addVisit(const std::string& patientID, const std::string& date, const std::string& diagnosis, const std::string& prescription) {
    if(!patientExists(patientID)) {
        std::cout << "Error: Cannot add visit. Patient does not exist.\n";
        return;
    }
    visits.push_back(Visit(patientID, date, diagnosis, prescription));
    std::cout << "Visit added successfully.\n";
    saveData();
}

void HospitalSystem::displayPatientHistory(const std::string& patientID) const {
    if(!patientExists(patientID)) {
        std::cout << "Error: Patient not found.\n";
        return;
    }
    std::cout << "--- Visit History for Patient " << patientID << " ---\n";
    bool found = false;
    for(const auto& v : visits) {
        if(v.getPatientID() == patientID) {
            std::cout << "Date: " << v.getDate() 
                      << " | Diagnosis: " << v.getDiagnosis() 
                      << " | Prescription: " << v.getPrescription() << "\n";
            found = true;
        }
    }
    if(!found) std::cout << "No visits found for this patient.\n";
}

void HospitalSystem::reportFrequentVisitors(int N) const {
    std::unordered_map<std::string, int> visitCounts;
    for(const auto& v : visits) {
        visitCounts[v.getPatientID()]++;
    }

    std::cout << "--- Patients with more than " << N << " visits ---\n";
    bool found = false;
    for(const auto& pair : visitCounts) {
        if(pair.second > N) {
            std::cout << "Patient ID: " << pair.first << " | Total Visits: " << pair.second << "\n";
            found = true;
        }
    }
    if(!found) std::cout << "No frequent visitors found.\n";
}

void HospitalSystem::reportTotalVisitsThisMonth(const std::string& monthPrefix) const {
    int count = 0;
    for(const auto& v : visits) {
        if(v.getDate().find(monthPrefix) == 0) {
            count++;
        }
    }
    std::cout << "Total visits in " << monthPrefix << ": " << count << "\n";
}
