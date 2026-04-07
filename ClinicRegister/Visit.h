#ifndef VISIT_H
#define VISIT_H

#include <string>

class Visit {
private:
    std::string patientID;
    std::string date; // Format YYYY-MM-DD
    std::string diagnosis;
    std::string prescription;

public:
    Visit() : patientID(""), date(""), diagnosis(""), prescription("") {}
    Visit(std::string id, std::string d, std::string diag, std::string pres);

    std::string getPatientID() const;
    std::string getDate() const;
    std::string getDiagnosis() const;
    std::string getPrescription() const;

    std::string toString() const;
    static Visit fromString(const std::string& line);
};

#endif
