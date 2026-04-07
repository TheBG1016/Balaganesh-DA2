# Goal Description
Develop a C++ mini project "Clinic Register" for a small clinic to maintain patient registration and visit notes.
Requirements: 
- OOP design (Classes: `Patient`, `Visit`, `HospitalSystem`)
- File input/output for persistence
- Usage of `std::vector`
- Menu-driven interface
- Compilation to WebAssembly (WASM) and hosting on GitHub Pages

## Proposed Changes
We will create a structured C++ project and set up a GitHub Actions workflow that will handle the WebAssembly compilation since Emscripten is not installed locally. The compiled files will be pushed to a `gh-pages` branch for deployment.

### C++ Source Files
- **`Patient.h` & `Patient.cpp`**: 
  - Manage `PatientID`, `Name`, `Age`, `Phone`.
  - Methods to read/write to files.
- **`Visit.h` & `Visit.cpp`**: 
  - Manage `PatientID`, `Date`, `Diagnosis`, `Prescription`.
  - Methods to read/write to files.
- **`HospitalSystem.h` & `HospitalSystem.cpp`**: 
  - Will own `std::vector<Patient>` and `std::vector<Visit>`.
  - Handle logic: uniqueness validation, registering, add visit, and generating reports.
- **`main.cpp`**:
  - Menu-driven loop (Register, Add Visit, Search, Reports, Exit) interacting with `HospitalSystem`.

### GitHub Actions & Emscripten deployment
- **`CMakeLists.txt`**: To easily compile the project via Emscripten.
- **`index.html`**: A custom wrapper for the WebAssembly terminal layout.
- **`.github/workflows/deploy.yml`**: A GitHub Actions CI script to:
  1. Check out the code.
  2. Install Emscripten setup (`mymindstorm/setup-emsdk`).
  3. Compile source code.
  4. Deploy the contents to `gh-pages` branch so the user can easily enable GitHub Pages.

## Verification Plan

### Automated Tests
_None - project relies on C++ manual execution test initially. We can add minor script validation during CI._

### Manual Verification
1. Open the project in the preferred IDE/compiler locally and check standard C++ compilation.
2. Run the application executable:
   - Try to add a patient and verify unique ID behavior.
   - Add a visit for a non-existing patient (should fail).
   - Ensure the records are saved to the text files.
   - Rerun the application and verify if data persists.
3. Push the repository to GitHub:
   - Check the GitHub Actions run to ensure WASM compilation succeeds.
   - Turn on GitHub Pages (Settings -> Pages -> gh-pages branch) and check if the menu UI works via the Web browser.
