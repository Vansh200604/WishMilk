const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return {
      title: "🌅 GOOD MORNING",
      subtitle: "Fresh milk delivered every morning",
    };
  }

  if (hour >= 12 && hour < 17) {
    return {
      title: "☀️ GOOD AFTERNOON",
      subtitle: "Fresh milk for your afternoon needs",
    };
  }

  if (hour >= 17 && hour < 20) {
    return {
      title: "🌇 GOOD EVENING",
      subtitle: "Fresh milk for your evening needs",
    };
  }

  return {
    title: "🌙 GOOD NIGHT",
    subtitle: "Book now for tomorrow morning's fresh milk",
  };
};
export default getGreeting;
