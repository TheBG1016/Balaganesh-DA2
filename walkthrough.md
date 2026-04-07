# Walkthrough: Clinic Register
We have successfully developed the Clinic Register mini-project following your requirements!

## Accomplishments
- **Object-Oriented Design**: We fully implemented `Patient.h/.cpp` and `Visit.h/.cpp` along with the core `HospitalSystem` integrating both.
- **File Persistence**: `patients.txt` and `visits.txt` keep local storage intact between session restarts.
- **Requirements Satisfied**: Validated unique Patient IDs, reports matching queries, checking non-existing visits, compiling via vector management.
- **WebAssembly Deployment Setup**: Because local Emscripten tools were absent on your Windows environment, we successfully bypassed standard limits by writing a **GitHub Actions** CI workflow (`.github/workflows/pages.yml`)! 
  
## How to Test the Project

**Local Run (C++)**
You can compile and run locally. Since you have `g++` configured:
1. Open terminal inside `d:/Education/VIT/OOPs/BG DA2/ClinicRegister`.
2. Run `g++ Patient.cpp Visit.cpp HospitalSystem.cpp main.cpp -o main`
3. `./main` to test all prompt inputs natively.

**WebAssembly (WASM) & GitHub Pages**
1. Initiate a **Git repository** in the `BG DA2` folder and push everything to a repository on your GitHub account.
   ```bash
   git init
   git add ClinicRegister .github
   git commit -m "Initial commit of Clinic Register"
   git branch -M main
   git remote add origin https://github.com/YourUsername/YourRepository.git
   git push -u origin main
   ```
2. Once pushed, navigate to your GitHub repo -> Actions. Wait for the `Build and Deploy to GitHub Pages` workflow to complete.
3. Turn on GitHub Pages (Settings -> Pages -> Ensure it's using the new GitHub Actions workflow integration) and you will automatically have the C++ terminal UI hosted via Emscripten locally on `YourUsername.github.io/YourRepository` !
