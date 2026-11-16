@echo off
echo Starting the Emerge on Horizon website...
echo Your browser will open at http://localhost:8080
echo Keep this window open while you look at the site. Close it to stop.
npx --yes http-server -p 8080 -c-1 -o
