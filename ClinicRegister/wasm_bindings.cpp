#include <emscripten.h>
#include "HospitalSystem.h"

// Instantiate the global application instance purely for the web interface
HospitalSystem system_instance;

extern "C" {
    
    // EXPORTED FUNCTIONS TO JAVASCRIPT
    
    EMSCRIPTEN_KEEPALIVE
    bool patientExists_js(const char* id) {
        return system_instance.patientExists(id);
    }
    
    EMSCRIPTEN_KEEPALIVE
    void registerPatient_js(const char* id, const char* name, int age, const char* phone) {
        system_instance.registerPatient(id, name, age, phone);
    }

    EMSCRIPTEN_KEEPALIVE
    void addVisit_js(const char* patientID, const char* date, const char* diagnosis, const char* prescription) {
        system_instance.addVisit(patientID, date, diagnosis, prescription);
    }
    
    EMSCRIPTEN_KEEPALIVE
    void displayPatientHistory_js(const char* patientID) {
        system_instance.displayPatientHistory(patientID);
    }
    
    EMSCRIPTEN_KEEPALIVE
    void reportFrequentVisitors_js(int n) {
        system_instance.reportFrequentVisitors(n);
    }

    EMSCRIPTEN_KEEPALIVE
    void reportTotalVisitsThisMonth_js(const char* month) {
        system_instance.reportTotalVisitsThisMonth(month);
    }

}
