// Navigation utility for React Router v6
// This provides a way to navigate outside of React components

let navigate = null;

export const setNavigate = (nav) => {
  navigate = nav;
};

const customHistory = {
  push: (path, state) => {
    if (navigate) {
      navigate(path, { state });
    } else {
      console.error(
        "Navigation not initialized. Make sure NavigationSetter is rendered.",
      );
    }
  },
  replace: (path, state) => {
    if (navigate) {
      navigate(path, { replace: true, state });
    } else {
      console.error(
        "Navigation not initialized. Make sure NavigationSetter is rendered.",
      );
    }
  },
  go: (n) => {
    if (navigate) {
      navigate(n);
    } else {
      console.error(
        "Navigation not initialized. Make sure NavigationSetter is rendered.",
      );
    }
  },
  goBack: () => {
    if (navigate) {
      navigate(-1);
    } else {
      console.error(
        "Navigation not initialized. Make sure NavigationSetter is rendered.",
      );
    }
  },
  goForward: () => {
    if (navigate) {
      navigate(1);
    } else {
      console.error(
        "Navigation not initialized. Make sure NavigationSetter is rendered.",
      );
    }
  },
};

export default customHistory;
