#include "Visit.h"
#include <sstream>

Visit::Visit(std::string id, std::string d, std::string diag, std::string pres)
    : patientID(id), date(d), diagnosis(diag), prescription(pres) {}

std::string Visit::getPatientID() const { return patientID; }
std::string Visit::getDate() const { return date; }
std::string Visit::getDiagnosis() const { return diagnosis; }
std::string Visit::getPrescription() const { return prescription; }

std::string Visit::toString() const {
    return patientID + "|" + date + "|" + diagnosis + "|" + prescription;
}

Visit Visit::fromString(const std::string& line) {
    std::stringstream ss(line);
    std::string id, d, diag, pres;
    std::getline(ss, id, '|');
    std::getline(ss, d, '|');
    std::getline(ss, diag, '|');
    std::getline(ss, pres, '|');
    return Visit(id, d, diag, pres);
}
