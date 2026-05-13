@echo off
echo ========================================
echo  Airbnb Clone - Frontend GitHub Push
echo ========================================
echo.

echo Step 1: Make sure you've created the repository on GitHub
echo Repository name: Airbnb-app
echo URL: https://github.com/Alain296/Airbnb-app
echo.
pause

echo.
echo Step 2: Removing old remote (if exists)...
git remote remove origin 2>nul

echo.
echo Step 3: Adding new remote...
git remote add origin https://github.com/Alain296/Airbnb-app.git

echo.
echo Step 4: Checking git status...
git status

echo.
echo Step 5: Pushing to GitHub...
git push -u origin main

echo.
echo ========================================
echo  Push Complete!
echo ========================================
echo.
echo Your frontend code is now on GitHub!
echo Visit: https://github.com/Alain296/Airbnb-app
echo.
pause
