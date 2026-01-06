window.AuthAnalyzer = {
  analyze: function(files) {
    const authProviders = [
      { key: "Google OAuth", match: ["google", "gapi", "@react-oauth/google", "next-auth/providers/google"] },
      { key: "Facebook", match: ["facebook", "fb", "react-facebook-login"] },
      { key: "NextAuth", match: ["next-auth", "getServerSession", "useSession"] },
      { key: "Firebase Auth", match: ["firebase/auth"] },
      { key: "Auth0", match: ["@auth0/auth0-react"] },
      { key: "Custom JWT", match: ["Authorization", "Bearer", "access_token"] },
    ];

    let foundProviders = new Set();
    let authTypes = new Set();

    const packageJsonFile = files.find(file => file.name.endsWith('package.json'));
    if (packageJsonFile) {
        const content = packageJsonFile.content;
        authProviders.forEach(provider => {
            provider.match.forEach(match => {
                if (content.includes(`"${match}"`)) {
                    foundProviders.add(provider.key);
                }
            });
        });
    }

    files.forEach(file => {
      if (file.name.endsWith('.js') || file.name.endsWith('.jsx') || file.name.endsWith('.ts') || file.name.endsWith('.tsx') || file.name.endsWith('.html')) {
        const content = file.content;

        authProviders.forEach(provider => {
          provider.match.forEach(match => {
            if (content.includes(match)) {
              foundProviders.add(provider.key);
            }
          });
        });

        if (content.match(/Cookies|js-cookie|react-cookie/i)) {
            authTypes.add('Cookie-based');
        }
        if (content.match(/Authorization:\s*Bearer/i)) {
            authTypes.add('Token (JWT)');
        }
        if (content.match(/getServerSession|useSession/i)) {
            authTypes.add('Session (NextAuth)');
        }
      }
      
      if(file.name.includes('.env')) {
        const content = file.content;
        if(content.includes('GOOGLE_CLIENT_ID')) {
            foundProviders.add('Google OAuth');
        }
      }
    });

    return {
      providers: [...foundProviders],
      types: [...authTypes],
    };
  }
};
