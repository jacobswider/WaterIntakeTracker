# Sample Weekly Meeting Notes:
Please note that this is the required layout for the weekly notes.

## Overview:
**When**:  Mon Mar 17
**Duration**:  1 hour
**Where**:  Discord

## Attendance
Ethan Irimiciuc, Jacob Swider, Sai Chittala
**Late**: Name (why)  
**Missing**: N/A

## Recent Progress:

## Meeting Notes: 
 Make App that tracks how much water you drink and when you drink enough water on the given day the program gives you a reward/points
 Will implement a barcode scanner to track each bottle the user drinks or manualy add how much water drank

 Continuing Balance of Work:
 We will at least once a week and make sure to distribute fair amounts of work to everyone

 App improves a real problem by encouraging people to drink water to improve their health

 APP ROUGH SKETCH:

 Front End:
    Tracker for water drank,
    camera interface for barcode,
    interface to manually enter water in ml/other units,
    log to track water drank with time/amount

Back End:
    Stack/dictionary for keeping track of log
    Trie for the barcode search

Ethical Issues:
    Data Privacy and Security: Logs water intake and barcode info.
    Informed Consent: Get explicit permission from users
    
Project Breakdown:

Week 1 (March 17-24): Plan the application out for the upcoming milestones.
Week 2 (March 24-31): Developing the front-end for basic testing purposes, like checking if buttons work properly or not.
Week 3 (March 21-April 7): Developing the back-end needed. Start implementing the data structures and testing them out little by little. Have a rough draft ready for fgp5 milestone
Week 4 (April 7-14): Continue polishing the project needed before the deadline.
Week 5 (April 14-21): Continue polishing the project needed before the deadline and begin testing.
Week 6 (April 21-28): Implement the log. Adding finishing touches for the project before deadline.

DataSource & Backend Integration

Data Source:
- The app gets data from user inputs: barcode scans and manual water entries.
- This method is appropriate since it directly tracks real-time water consumption.

How Data is Pulled to the Backend:
- When a user logs water intake (via scan or manual entry), the data (amount, time, barcode details) is sent straight to the backend.
- The backend receives the data immediately and logs it using our data structures (like dictionaries for records and a trie for barcode lookups).

Data Processing & Cleaning:
- Incoming data is first validated to ensure it’s in the correct format (positive water amounts, proper timestamps).
- Barcode data is processed with a trie to quickly match and verify product details.
- Manual entries are standardized (like converting liters to milliliters) for consistency.
- Any incomplete or faulty data is flagged for review or auto-corrected to maintain clean logs.

Data Structures:

We opt to use a dictionary for our log as we can assign a day to each log, and map specific amounts of values of water to times/dates. This is optimal becasue we can set up dictionary to have everything sorted chronologically.

We will also implement a trie for barcode search. A trie will have fast lookup and search which is optimal for our case.

Alternative Data Structures:

Stack: We considered stack for our log but didnt use it because dictionary was better
Priority Queue: Implementation did not seem as clean as a stack of dictionary implementation for a log

## Action Items (Work In Progress):
