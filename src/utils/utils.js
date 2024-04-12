export function isLoginTimestampValid() {
    const loginTimestamp = localStorage.getItem("loginTimestamp");
  
    // Check if loginTimestamp exists in localStorage
    if (!loginTimestamp) {
      return false;
    }
  
    // Convert the timestamp to a Date object
    const loginDate = new Date(parseInt(loginTimestamp));
  
    // Calculate the difference in minutes between the current time and the login time
    const timeDiffInMinutes = (Date.now() - loginDate.getTime()) / (1000 * 60);
  
    // Check if the time difference is more than 30 minutes
    if (timeDiffInMinutes > 30) {
      return false;
    }
  
    return true;
  }