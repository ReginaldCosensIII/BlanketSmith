import { DEFAULT_STITCH_LIBRARY, StitchDefinition } from '../../data/stitches';

/**
 * Registry for all available stitches.
 * Currently backed by the static `DEFAULT_STITCH_LIBRARY`, but designed
 * to be extensible for user-defined stitches or larger libraries.
 */
export class StitchRegistry {
    private static instance: StitchRegistry;
    private stitches: Map<string, StitchDefinition>;

    private constructor() {
        this.stitches = new Map();
        // Load defaults
        DEFAULT_STITCH_LIBRARY.forEach(stitch => {
            this.stitches.set(stitch.id, stitch);
        });
    }

    public static getInstance(): StitchRegistry {
        if (!StitchRegistry.instance) {
            StitchRegistry.instance = new StitchRegistry();
        }
        return StitchRegistry.instance;
    }

    public getStitch(id: string): StitchDefinition | undefined {
        return this.stitches.get(id);
    }

    public getAllStitches(): StitchDefinition[] {
        return Array.from(this.stitches.values());
    }

    /**
     * Registers a new stitch definition. 
     * Overwrites existing if ID matches.
     */
    public register(stitch: StitchDefinition): void {
        this.stitches.set(stitch.id, stitch);
    }
}
