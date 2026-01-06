window.AuthAnalyzer = {
  analyze: function(files) {
    const authProviders = [
      { key: "Google OAuth", match: ["@react-oauth/google", "next-auth/providers/google"] },
      { key: "Facebook", match: ["react-facebook-login"] },
      { key: "NextAuth", match: ["next-auth", "getServerSession", "useSession"] },
      { key: "Firebase Auth", match: ["firebase/auth"] },
      { key: "Auth0", match: ["@auth0/auth0-react"] }
    ];

    const customJwtMatches = {
        "Custom JWT": [/Authorization:\s*Bearer/i, /['"`]access_token['"`]/],
    };

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
        if (content.includes('"google"') || content.includes('"gapi"')) {
            foundProviders.add("Google OAuth");
        }
        if (content.includes('"facebook"') || content.includes('"fb"')) {
            foundProviders.add("Facebook");
        }
    }

    files.forEach(file => {
      if (file.name.endsWith('.js') || file.name.endsWith('.jsx') || file.name.endsWith('.ts') || file.name.endsWith('.tsx') || file.name.endsWith('.html')) {
        const content = file.content;

        authProviders.forEach(provider => {
          provider.match.forEach(match => {
            const importRegex = new RegExp(`(import|require).*['"]${match}['"]`);
            if (importRegex.test(content)) {
              foundProviders.add(provider.key);
            }
          });
        });
        
        for (const providerKey in customJwtMatches) {
            customJwtMatches[providerKey].forEach(regex => {
                if (regex.test(content)) {
                    foundProviders.add(providerKey);
                }
            });
        }

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
