#include <emscripten.h>
#include "HospitalSystem.h"

// Instantiate lazily so Emscripten has time to mount preload files!
HospitalSystem* system_ptr = nullptr;

HospitalSystem& getSystem() {
    if (!system_ptr) {
        system_ptr = new HospitalSystem();
    }
    return *system_ptr;
}

extern "C" {
    
    // EXPORTED FUNCTIONS TO JAVASCRIPT
    
    EMSCRIPTEN_KEEPALIVE
    bool patientExists_js(const char* id) {
        return getSystem().patientExists(id);
    }
    
    EMSCRIPTEN_KEEPALIVE
    void registerPatient_js(const char* id, const char* name, int age, const char* phone) {
        getSystem().registerPatient(id, name, age, phone);
    }

    EMSCRIPTEN_KEEPALIVE
    void addVisit_js(const char* patientID, const char* date, const char* diagnosis, const char* prescription) {
        getSystem().addVisit(patientID, date, diagnosis, prescription);
    }
    
    EMSCRIPTEN_KEEPALIVE
    void displayPatientHistory_js(const char* patientID) {
        getSystem().displayPatientHistory(patientID);
    }
    
    EMSCRIPTEN_KEEPALIVE
    void reportFrequentVisitors_js(int n) {
        getSystem().reportFrequentVisitors(n);
    }

    EMSCRIPTEN_KEEPALIVE
    void reportTotalVisitsThisMonth_js(const char* month) {
        getSystem().reportTotalVisitsThisMonth(month);
    }

}
