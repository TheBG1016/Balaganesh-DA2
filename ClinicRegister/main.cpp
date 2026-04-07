#include "HospitalSystem.h"
#include <iostream>
#include <string>

void showMenu() {
    std::cout << "\n=== Clinic Register ===\n";
    std::cout << "1. Register Patient\n";
    std::cout << "2. Add Visit Record\n";
    std::cout << "3. Search Patient & Show History\n";
    std::cout << "4. Report: Frequent Visitors\n";
    std::cout << "5. Report: Total Visits this Month\n";
    std::cout << "0. Exit\n";
    std::cout << "Enter your choice: ";
}

int main() {
    HospitalSystem system;
    int choice;

    while (true) {
        showMenu();
        if (!(std::cin >> choice)) {
            std::cin.clear();
            std::cin.ignore(10000, '\n');
            continue;
        }
        
        if (choice == 0) {
            std::cout << "Exiting...\n";
            break;
        }

        switch (choice) {
            case 1: {
                std::string id, name, phone;
                int age;
                std::cout << "Enter Patient ID: ";
                std::cin >> id;
                std::cin.ignore();
                std::cout << "Enter Name: ";
                std::getline(std::cin, name);
                std::cout << "Enter Age: ";
                std::cin >> age;
                std::cout << "Enter Phone: ";
                std::cin >> phone;
                system.registerPatient(id, name, age, phone);
                break;
            }
            case 2: {
                std::string id, date, diag, pres;
                std::cout << "Enter Patient ID: ";
                std::cin >> id;
                std::cout << "Enter Date (YYYY-MM-DD): ";
                std::cin >> date;
                std::cin.ignore();
                std::cout << "Enter Diagnosis: ";
                std::getline(std::cin, diag);
                std::cout << "Enter Prescription: ";
                std::getline(std::cin, pres);
                system.addVisit(id, date, diag, pres);
                break;
            }
            case 3: {
                std::string id;
                std::cout << "Enter Patient ID: ";
                std::cin >> id;
                system.displayPatientHistory(id);
                break;
            }
            case 4: {
                int n;
                std::cout << "Enter N (number of visits): ";
                std::cin >> n;
                system.reportFrequentVisitors(n);
                break;
            }
            case 5: {
                std::string month;
                std::cout << "Enter Month (YYYY-MM): ";
                std::cin >> month;
                system.reportTotalVisitsThisMonth(month);
                break;
            }
            default:
                std::cout << "Invalid choice. Try again.\n";
        }
    }

    return 0;
}
