#include "HospitalSystem.h"
#include <iostream>
#include <fstream>
#include <unordered_map>

HospitalSystem::HospitalSystem() {
    loadData();
    if (patients.empty()) {
        // 10 patients
        registerPatient("P001", "John Doe", 45, "555-1234");
        registerPatient("P002", "Jane Smith", 30, "555-5678");
        registerPatient("P003", "Alice Johnson", 60, "555-8765");
        registerPatient("P004", "Bob Williams", 25, "555-4321");
        registerPatient("P005", "Charlie Brown", 12, "555-9999");
        registerPatient("P006", "Diana Prince", 29, "555-8888");
        registerPatient("P007", "Ethan Hunt", 40, "555-7777");
        registerPatient("P008", "Fiona Gallagher", 35, "555-6666");
        registerPatient("P009", "George R", 55, "555-5555");
        registerPatient("P010", "Hannah Abbott", 19, "555-4444");

        // varying number of visits
        addVisit("P001", "2023-01-15", "Flu", "Rest and hydration");
        addVisit("P001", "2023-02-10", "Follow up", "Vitamins");
        addVisit("P001", "2023-05-22", "Allergy", "Antihistamines"); 

        addVisit("P002", "2023-03-05", "Sprained Ankle", "Ice and Rest");
        addVisit("P002", "2023-03-20", "Follow up", "Physical Therapy"); 

        addVisit("P003", "2023-04-11", "Hypertension", "Lisinopril");
        addVisit("P003", "2023-06-15", "Routine Checkup", "None"); 
        addVisit("P003", "2023-08-10", "High Cholesterol", "Statins"); 
        addVisit("P003", "2023-10-01", "Follow up", "Continue Medications"); 

        addVisit("P004", "2023-07-07", "Migraine", "Painkillers"); 

        addVisit("P005", "2023-01-10", "Common Cold", "Cough syrup");
        addVisit("P005", "2023-09-05", "Fever", "Acetaminophen"); 

        addVisit("P006", "2023-05-18", "Back Pain", "Muscle Relaxants");
        addVisit("P006", "2023-06-02", "Follow up", "Physical Therapy");
        addVisit("P006", "2023-07-20", "Checkup", "None"); 

        addVisit("P007", "2023-11-11", "Knee Injury", "Surgery Consult");
        addVisit("P007", "2023-11-25", "Post-op", "Rest"); 
        addVisit("P007", "2023-12-10", "Rehab", "Physical Therapy");
        addVisit("P007", "2023-12-24", "Follow up", "None");
        addVisit("P007", "2024-01-15", "Final Check", "Cleared"); 
        
        addVisit("P008", "2023-08-20", "Asthma", "Inhaler"); 

        addVisit("P009", "2023-02-14", "Diabetes Check", "Insulin");
        addVisit("P009", "2023-06-14", "Routine Check", "Keep Diet"); 
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
