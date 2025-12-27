export class FeatureFlagService {
    private static EDGE_CONFIG_ID = (import.meta as any).env.VITE_EDGE_CONFIG_ID;
    private static EDGE_CONFIG_TOKEN = (import.meta as any).env.VITE_EDGE_CONFIG_TOKEN;

    static async isEnabled(flagName: string): Promise<boolean> {
        if (!this.EDGE_CONFIG_ID || !this.EDGE_CONFIG_TOKEN) {
            // Fallback to local defaults if Edge Config is not set up
            return this.getLocalDefault(flagName);
        }

        try {
            const response = await fetch(
                `https://edge-config.vercel.com/${this.EDGE_CONFIG_ID}/get?key=${flagName}`,
                {
                    headers: {
                        Authorization: `Bearer ${this.EDGE_CONFIG_TOKEN}`,
                    },
                }
            );

            if (!response.ok) return this.getLocalDefault(flagName);

            const data = await response.json();
            return data === true;
        } catch (error) {
            console.error(`Error fetching feature flag ${flagName}:`, error);
            return this.getLocalDefault(flagName);
        }
    }

    private static getLocalDefault(flagName: string): boolean {
        const defaults: Record<string, boolean> = {
            'new-pos-ui-enabled': true
        };
        return defaults[flagName] ?? false;
    }
}
