#ifndef HOSPITALSYSTEM_H
#define HOSPITALSYSTEM_H

#include "Patient.h"
#include "Visit.h"
#include <vector>
#include <string>

class HospitalSystem {
private:
    std::vector<Patient> patients;
    std::vector<Visit> visits;

    void loadData();
    void saveData() const;

public:
    HospitalSystem();
    ~HospitalSystem();

    void registerPatient(const std::string& id, const std::string& name, int age, const std::string& phone);
    void addVisit(const std::string& patientID, const std::string& date, const std::string& diagnosis, const std::string& prescription);
    
    void displayPatientHistory(const std::string& patientID) const;
    void reportFrequentVisitors(int N) const;
    void reportTotalVisitsThisMonth(const std::string& monthPrefix) const;
    
    bool patientExists(const std::string& patientID) const;
};

#endif
