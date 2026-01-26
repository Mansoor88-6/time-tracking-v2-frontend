// Utils function for getting initials from name
export const getInitialsFromName = (name: string | null | undefined): string => {
    if (!name) return "?";
    
    // Split the name into parts and filter out empty strings
    const nameParts = name.trim().split(/\s+/).filter(Boolean);
    
    if (nameParts.length === 1) {
      // Single name - take first two letters of that name
      return nameParts[0].slice(0, 2).toUpperCase();
    } 
    
    // Multiple names scenario
    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
    
    // If first letters are same, use first letter of first name and second letter of last name
    if (firstName.charAt(0).toLowerCase() === lastName.charAt(0).toLowerCase()) {
      return (firstName.charAt(0) + (lastName.charAt(1) || lastName.charAt(0))).toUpperCase();
    }
    
    // Default: first letter of first name and first letter of last name
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };