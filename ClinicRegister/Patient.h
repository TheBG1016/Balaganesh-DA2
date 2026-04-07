#ifndef PATIENT_H
#define PATIENT_H

#include <string>

class Patient {
private:
    std::string patientID;
    std::string name;
    int age;
    std::string phone;

public:
    Patient() : patientID(""), name(""), age(0), phone("") {}
    Patient(std::string id, std::string n, int a, std::string p);

    std::string getPatientID() const;
    std::string getName() const;
    int getAge() const;
    std::string getPhone() const;

    std::string toString() const;
    static Patient fromString(const std::string& line);
};

#endif
