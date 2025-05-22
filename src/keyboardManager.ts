/**
 * Manages keyboard input events including global and key-specific callbacks.
 */
export class KeyboardManager {

    /** Set of currently pressed keys (in lowercase). */
    currentKeysDown: Set<string> = new Set()
    /** Indicates whether the Ctrl key is currently held down. */
    ctrlHeldDown: boolean = false
    /** Indicates whether the Shift key is currently held down. */
    shiftHeldDown: boolean = false
    /** Indicates whether the Alt key is currently held down. */
    altHeldDown: boolean = false
    /** Map of global key press event callbacks, keyed by unique tag. */
    private keyPressEvents: Map<string, () => void> = new Map()
    /** Map of unique key-specific press callbacks, keyed by lowercase key string. */
    private uniqueKeyPressEvents: Map<string, () => void> = new Map()

    /**
     * Initializes the keyboard manager and registers key event listeners.
     */
    constructor() {
        document.addEventListener("keydown", (e) => this.keydownManager(e))
        document.addEventListener("keyup", (e) => this.keyupManager(e))
    }

    /**
     * Handles `keydown` events, triggering global and key-specific callbacks if it's a new press.
     * @param {KeyboardEvent} e - The keyboard event.
     */
    private keydownManager(e: KeyboardEvent) {
        const key = e.key.toLowerCase()

        if (!this.currentKeysDown.has(key)) {
            this.keyPressEvents.forEach(callback => callback())
            this.uniqueKeyPressEvents.get(key)?.()
        }

        this.currentKeysDown.add(key)
        this.ctrlHeldDown = e.ctrlKey
        this.shiftHeldDown = e.shiftKey
        this.altHeldDown = e.altKey
    }

    /**
     * Handles `keyup` events and updates modifier key states.
     * @param {KeyboardEvent} e - The keyboard event.
     */
    private keyupManager(e: KeyboardEvent) {
        const key = e.key.toLowerCase()

        this.currentKeysDown.delete(key)
        this.ctrlHeldDown = e.ctrlKey
        this.shiftHeldDown = e.shiftKey
        this.altHeldDown = e.altKey
    }

    /**
     * Checks if a specific key is currently being held down.
     * @param {string} key - The key to check (case-insensitive).
     * @returns {boolean} True if the key is currently down, otherwise false.
     */
    public isKeyDown(key: string): boolean {
        return this.currentKeysDown.has(key.toLowerCase())
    }

    /**
     * Adds a new global key press callback that runs only on any first key press.
     * @param {string} tag - Unique identifier for the callback.
     * @param {() => void} callBack - The function to call.
     */
    public addNewKeyPressEvent(tag: string, callBack: () => void): void {
        this.keyPressEvents.set(tag, callBack)
    }

    /**
     * Removes a previously added global key press callback.
     * @param {string} tag - Unique identifier of the callback to remove.
     */
    public removeNewKeyPressEvent(tag: string): void {
        this.keyPressEvents.delete(tag)
    }

    /**
     * Adds a callback for a specific key that only runs once per press.
     * @param {string} key - The key to bind the callback to (case-insensitive).
     * @param {() => void} callBack - The function to call.
     */
    public addNewUniqueKeyPressEvent(key: string, callBack: () => void): void {
        this.uniqueKeyPressEvents.set(key.toLowerCase(), callBack)
    }

    /**
     * Removes a unique key-specific callback.
     * @param {string} key - The key whose callback should be removed (case-insensitive).
     */
    public removeNewUniqueKeyPressEvent(key: string): void {
        this.uniqueKeyPressEvents.delete(key.toLowerCase())
    }
}
