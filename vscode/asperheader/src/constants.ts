/**
 * @file constants.ts
 * @brief Global constants and configuration values for AsperHeader extension
 * @author Henry Letellier
 * @version 1.0.0
 * @date 2025
 * 
 * This module defines all global constants, configuration values, and default settings
 * used throughout the AsperHeader VS Code extension. It centralizes configuration
 * management and provides compile-time constants for consistent behavior across
 * all extension modules.
 * 
 * Constant Categories:
 * - **Status Codes**: Return values for operation success/failure indication
 * - **Extension Identity**: Name, module identifier, and copyright information
 * - **Header Formatting**: Decoration patterns, spacing, and layout constants
 * - **Telegraph Protocol**: Constants for telegraph-style communication formatting
 * - **Header Keys**: Standardized keys for header metadata fields
 * - **Date/Time Formatting**: Separators and formatting patterns for timestamps
 * - **Default Logo**: ASCII art logo for header decoration
 * - **Behavioral Settings**: Feature toggles and operational parameters
 * 
 * Configuration Philosophy:
 * All magic numbers, strings, and behavioral flags are centralized here to:
 * - Enable easy maintenance and updates
 * - Ensure consistency across modules
 * - Provide single source of truth for configuration
 * - Support compile-time optimization
 * - Facilitate testing with known constant values
 * 
 * ASCII Art Management:
 * Contains multiple logo versions including legacy (commented) designs and
 * the current active logo. Logo data is stored as string arrays for line-by-line
 * rendering in file headers.
 * 
 * Extension Behavior:
 * Defines default behaviors for file scanning, logo randomization, save triggers,
 * and user prompting. These constants can be referenced by configuration
 * management systems for runtime behavior modification.
 */

// ============================================================================
// Status Codes
// ============================================================================

/** @brief Return code indicating operation failure or error condition */
export const statusError: number = 1;
/** @brief Return code indicating successful operation completion */
export const statusSuccess: number = 0;

// ============================================================================
// Extension Identity
// ============================================================================

/** @brief Human-readable name of the extension */
export const extensionName: string = "AsperHeader";
/** @brief Module identifier used in package.json and extension marketplace */
export const moduleName: string = "asperheader";
/** @brief Copyright notice for project attribution */
export const projectCopyright: string = "(c) Asperguide";

// ============================================================================
// Header Decoration Constants
// ============================================================================

/** @brief Opening decoration pattern for header borders */
export const headerOpenerDecorationOpen: string = "+==== ";
/** @brief Closing decoration pattern for header borders */
export const headerOpenerDecorationClose: string = " =================+";

/** @brief Standard spacing character used in header comment formatting */
export const headerCommentSpacing: string = " ";

// ============================================================================
// Telegraph Protocol Constants
// ============================================================================

/** @brief Telegraph protocol marker indicating message transmission start */
export const telegraphBegin: string = "BEGIN";
/** @brief Telegraph protocol marker indicating message transmission end */
export const telegraphEnd: string = "END";
/** @brief Telegraph protocol block termination marker */
export const telegraphBlockStop: string = "/STOP";
/** @brief Telegraph protocol end of transmission acknowledgment */
export const telegraphEndOfTransmission: string = "// AR";

// ============================================================================
// Header Layout Configuration
// ============================================================================

/** @brief Whether to add blank line after multiline header elements */
export const headerAddBlankLineAfterMultiline: boolean = false;

/** @brief Separator string between header keys and their values */
export const headerKeyDefinitionSeparator: string = ": ";

// ============================================================================
// Header Metadata Keys
// ============================================================================

/** @brief Key identifier for logo/ASCII art section in headers */
export const headerLogoKey: string = "LOGO";
/** @brief Key identifier for project name field in headers */
export const headerProjectKey: string = "PROJECT";
/** @brief Key identifier for filename field in headers */
export const headerFileKey: string = "FILE";
/** @brief Key identifier for file creation timestamp field */
export const headerCreationDateKey: string = "CREATION DATE";
/** @brief Key identifier for last modification timestamp field */
export const headerLastModifiedKey: string = "LAST Modified";
/** @brief Key identifier for file description field in headers */
export const headerDescriptionKey: string = "DESCRIPTION";
/** @brief Key identifier for copyright information field */
export const headerCopyrightKey: string = "COPYRIGHT";
/** @brief Key identifier for tag/category field in headers */
export const headerTagKey: string = "TAG";
/** @brief Key identifier for purpose/objective field in headers */
export const headerPurposeKey: string = "PURPOSE";

// ============================================================================
// Date and Time Formatting Constants
// ============================================================================

/** @brief Separator character between hour and minute in time formatting */
export const headerTimeSeperatorHour: string = ":";
/** @brief Separator character between minute and second in time formatting */
export const headerTimeSeperatorMinute: string = ":";
/** @brief Separator character after seconds in time formatting (empty for no separator) */
export const headerTimeSeperatorSecond: string = "";
/** @brief Separator character between date and time components */
export const headerTimeAndDateSeperator: string = " ";
/** @brief Separator character between day and month in date formatting */
export const headerDateSeperatorDay: string = "-";
/** @brief Separator character between month and year in date formatting */
export const headerDateSeperatorMonth: string = "-";
/** @brief Separator character after year in date formatting (empty for no separator) */
export const headerDateSeperatorYear: string = "";

// ============================================================================
// ASCII Art Logo Definitions
// ============================================================================

/**
 * @brief Legacy ASCII art logo (version 4) - currently disabled
 * 
 * This commented section contains the previous version of the ASCII art logo
 * used in file headers. Preserved for reference and potential future use.
 * The logo features a more detailed design with extended width and height.
 */
// logo v4
// export const defaultHeaderLogo: string[] = [
//     "................####.......####................",
//     ".............##.......#.##########.............",
//     "........#####.........#.###############........",
//     "......#...............#.#################......",
//     ".....#................#.##################.....",
//     "....#.................#.###################....",
//     "....#.................#.###################....",
//     "....##......###.......#.#####........######....",
//     "..#........####.......#.####...####...#######..",
//     ".#.........##.##......#.###...################.",
//     "#.........##...##.....#.###...#################",
//     "#........###############......###......########",
//     ".#.......##.....##....#.###...######...#######.",
//     "..#.....##......###...#.###...######..#######..",
//     "...##..###.......##...#.####.........#######...",
//     "...#...##.........##..#.#######....#########...",
//     "...#..................#.####################...",
//     "...#..................#.####################...",
//     "...#..................#.####################...",
//     "....##................#.###################....",
//     "......####............#.#################......",
//     "..........#...........#.#############..........",
//     "..........#...........#.#############..........",
//     "...........##........##.############...........",
//     "..............######.......######..............",
// ];

/**
 * @brief Current active ASCII art logo for file headers
 * 
 * Compact version of the AsperHeader logo designed for efficient space usage
 * in file headers while maintaining visual impact. Each string represents one
 * line of the ASCII art when rendered in monospace font.
 * 
 * Design Features:
 * - Optimized for narrow file headers
 * - Maintains readability at small sizes
 * - Uses period (.) for background and hash (#) for foreground
 * - 17 lines tall, 32 characters wide maximum
 * - Balanced visual weight and spacing
 */
export const defaultHeaderLogo: string[] = [
    "..........####...####..........",
    "......###.....#.#########......",
    "....##........#.###########....",
    "...#..........#.############...",
    "...#..........#.#####.######...",
    "..#.....##....#.###..#...####..",
    ".#.....#.##...#.##..##########.",
    "#.....##########....##...######",
    "#.....#...##..#.##..####.######",
    ".#...##....##.#.##..###..#####.",
    "..#.##......#.#.####...######..",
    "..#...........#.#############..",
    "..#...........#.#############..",
    "...##.........#.############...",
    "......#.......#.#########......",
    ".......#......#.########.......",
    ".........##.##...#####.........",
];

// ============================================================================
// Operational Configuration Constants
// ============================================================================

/** @brief Maximum number of lines to scan when searching for existing headers */
export const defaultMaxScanLength: number = 100;

/** @brief Global debug mode flag for development and troubleshooting */
export const enableDebug: boolean = true;

// ============================================================================
// Behavioral Feature Toggles
// ============================================================================

/** @brief Whether to automatically refresh headers when files are saved */
export const refreshOnSave: boolean = true;

/** @brief Whether to prompt user to create header if missing during operations */
export const promptToCreateIfMissing: boolean = true;

/** @brief Whether to use random logo selection instead of default logo */
export const randomLogo: boolean = false;

// ============================================================================
// Extension Filtering Configuration
// ============================================================================

/** @brief Array of file extensions to ignore during header processing */
export const extensionIgnore: string[] = [];

// ============================================================================
// End of Constants Definition
// ============================================================================

/**
 * @section Usage Guidelines
 * 
 * **Importing Constants:**
 * ```typescript
 * import { extensionName, defaultHeaderLogo } from './constants';
 * ```
 * 
 * **Modifying Behavior:**
 * To change extension behavior, update the appropriate constants in this file.
 * Most behavioral changes require extension restart to take effect.
 * 
 * **Adding New Constants:**
 * - Group related constants in logical sections
 * - Use descriptive names with appropriate prefixes
 * - Include comprehensive JSDoc documentation
 * - Consider type safety and const assertions where appropriate
 * 
 * **ASCII Art Guidelines:**
 * - Use periods (.) for background/empty space
 * - Use hash (#) for foreground/design elements
 * - Maintain consistent line lengths for proper alignment
 * - Test rendering in various monospace fonts
 * 
 * **Configuration Philosophy:**
 * This file serves as the single source of truth for all extension constants.
 * Avoid hardcoding values elsewhere in the codebase - define them here first.
 */

/**
 * @section Usage Guidelines
 * 
 * **Importing Constants:**
 * ```typescript
 * import { extensionName, defaultHeaderLogo } from './constants';
 * ```
 * 
 * **Modifying Behavior:**
 * To change extension behavior, update the appropriate constants in this file.
 * Most behavioral changes require extension restart to take effect.
 * 
 * **Adding New Constants:**
 * - Group related constants in logical sections
 * - Use descriptive names with appropriate prefixes
 * - Include comprehensive JSDoc documentation
 * - Consider type safety and const assertions where appropriate
 * 
 * **ASCII Art Guidelines:**
 * - Use periods (.) for background/empty space
 * - Use hash (#) for foreground/design elements
 * - Maintain consistent line lengths for proper alignment
 * - Test rendering in various monospace fonts
 * 
 * **Configuration Philosophy:**
 * This file serves as the single source of truth for all extension constants.
 * Avoid hardcoding values elsewhere in the codebase - define them here first.
 */
