#include "Patient.h"
#include <sstream>

Patient::Patient(std::string id, std::string n, int a, std::string p)
    : patientID(id), name(n), age(a), phone(p) {}

std::string Patient::getPatientID() const { return patientID; }
std::string Patient::getName() const { return name; }
int Patient::getAge() const { return age; }
std::string Patient::getPhone() const { return phone; }

std::string Patient::toString() const {
    return patientID + "," + name + "," + std::to_string(age) + "," + phone;
}

Patient Patient::fromString(const std::string& line) {
    std::stringstream ss(line);
    std::string id, n, ageStr, p;
    std::getline(ss, id, ',');
    std::getline(ss, n, ',');
    std::getline(ss, ageStr, ',');
    std::getline(ss, p, ',');
    int a = 0;
    try { a = std::stoi(ageStr); } catch(...) {}
    return Patient(id, n, a, p);
}
