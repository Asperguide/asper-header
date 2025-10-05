/**
 * @file constants.ts
 * @brief Global constants and configuration values for AsperHeader extension
 * @author Henry Letellier
 * @version 1.0.10
 * @since 1.0.0
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
    ".........#####...#####.........",
];

// ============================================================================
// Operational Configuration Constants
// ============================================================================

/** @brief Maximum number of lines to scan when searching for existing headers */
export const defaultMaxScanLength: number = 100;

/** @brief Global debug mode flag for development and troubleshooting */
export const enableDebug: boolean = false;

// ============================================================================
// Behavioral Feature Toggles
// ============================================================================

/** @brief Whether to automatically refresh headers when files are saved */
export const refreshOnSave: boolean = true;

/** @brief Whether to prompt user to create header if missing during operations */
export const promptToCreateIfMissing: boolean = true;

/** @brief Whether to use random logo selection instead of default logo */
export const randomLogo: boolean = false;

/** @brief the user setting that allows them to toggle to prefer the useage of a workspace name when available */
export const useWorkspaceNameWhenAvailable: boolean = false;

// ============================================================================
// Extension Filtering Configuration
// ============================================================================

/** @brief Array of file extensions to ignore during header processing */
export const extensionIgnore: string[] = [];

/** @brief the base64 logo of the author's icon */
export const authorLogo: string = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAAG0OVFdAAAAv3pUWHRSYXcgcHJvZmlsZSB0eXBlIGV4aWYAAHjabVBbEsMgCPznFD2CAho5jknTmd6gx+8aMRPbrMNDVleE9s/7RY8GjkyalpIt5wCoqXFFUkJHPXwMevgDg8J+qtNJMEqCKH4h+/lRj6dADxVZugptTqwzYer65UeIe5DWUctXFzIXEu5EdIHqrWYry/UL6xZmlG7UnJa57b/9guk9E94R4V0CTPvj0ixJlUBiCCyMQxGrwlolyRDCMO5mNEBfZjZYI+oHlEkAAAGEaUNDUElDQyBwcm9maWxlAAB4nH2RPUjDUBSFT1OlKhWHFhFxyFA72UVFHGsVilAh1AqtOpi89A+aNCQpLo6Ca8HBn8Wqg4uzrg6ugiD4A+IuOCm6SIn3JYUWsT64vI/z3jncdx8gNCpMs3rigKbbZjqZELO5VTHwin4MU4UQlZllzElSCl3X1z18fL+L8azu9/5cg2reYoBPJI4zw7SJN4hnNm2D8z5xmJVklficeMKkBokfua54/Ma56LLAM8NmJj1PHCYWix2sdDArmRrxNHFE1XTKF7Ieq5y3OGuVGmv1yV8YzOsry1ynGkMSi1iCBBEKaiijAhsx2nVSLKTpPNHFP+r6JXIp5CqDkWMBVWiQXT/4H/yerVWYmvSSggmg98VxPsaBwC7QrDvO97HjNE8A/zNwpbf91QYw+0l6va1FjoChbeDiuq0pe8DlDjDyZMim7Ep+KqFQAN7P6JtyQOgWGFjz5tY6x+kDkKFZpW6Ag0MgWqTs9S7v7uuc2793WvP7AZKlcrMQx/gGAAANcmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNC40LjAtRXhpdjIiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iCiAgICB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIgogICAgeG1sbnM6R0lNUD0iaHR0cDovL3d3dy5naW1wLm9yZy94bXAvIgogICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iCiAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgIHhtcE1NOkRvY3VtZW50SUQ9ImdpbXA6ZG9jaWQ6Z2ltcDowOWQ3ODk3OS03YjNiLTRhMTgtODM5ZS1lMDgwOGNjMmUzY2EiCiAgIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NTM2YWE3YmMtN2QzZS00ZDJkLWIxMjItYTFhZjQwMjkzYjI5IgogICB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6OTc2ZWEzNTgtNTNlNy00ODZkLWIzMzQtMjhmZWY1N2IyZWIzIgogICBHSU1QOkFQST0iMy4wIgogICBHSU1QOlBsYXRmb3JtPSJMaW51eCIKICAgR0lNUDpUaW1lU3RhbXA9IjE3NTg1MzI3OTM2NzA4NzIiCiAgIEdJTVA6VmVyc2lvbj0iMy4wLjQiCiAgIGRjOkZvcm1hdD0iaW1hZ2UvcG5nIgogICB0aWZmOk9yaWVudGF0aW9uPSIxIgogICB4bXA6Q3JlYXRvclRvb2w9IkdJTVAiCiAgIHhtcDpNZXRhZGF0YURhdGU9IjIwMjU6MDk6MjJUMTE6MTk6NTArMDI6MDAiCiAgIHhtcDpNb2RpZnlEYXRlPSIyMDI1OjA5OjIyVDExOjE5OjUwKzAyOjAwIj4KICAgPHhtcE1NOkhpc3Rvcnk+CiAgICA8cmRmOlNlcT4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZGE1MDJhZWEtNDM0MS00NjdjLTgwMzEtYjUwMmU2OGFhYjkwIgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJHSU1QIDMuMC40IChMaW51eCkiCiAgICAgIHN0RXZ0OndoZW49IjIwMjUtMDktMjJUMTE6MTk6NTMrMDI6MDAiLz4KICAgIDwvcmRmOlNlcT4KICAgPC94bXBNTTpIaXN0b3J5PgogIDwvcmRmOkRlc2NyaXB0aW9uPgogPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgIAo8P3hwYWNrZXQgZW5kPSJ3Ij8+QZaInQAAAAZiS0dEAAAAAAAA+UO7fwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB+kJFgkTNb1wNOYAABokSURBVHja7V15dFRF1r9V7/WW7mwsAZJ0SJpElARhUBM0gKNwjsM2gIMw+oF+Ss4MHy5DmBEB56g4Is6ZIQGRJYownzIalCUzLnj0Cx7GBZhAWISIMGaTYIBgku5Od7+t7vdH8pruTifpzkaAd8+pk8573fWqbv3q3lu3bt1HEPEkAAyAThLf8uNBna2AQhfJW4EkSV2rgOd5SEpKavWF/yv+9DwA60IXkLb7tY4rIAxCbgGi4lMQEBF0vAEAKEiSBIgINpuNtVkBIRwQQvyKokgAwOCuu+5qIoSALMu0gy4E9rn5/5KSEjMiQlVVFeTn51eVlpZebmk21mILWa1WDKTi4s9qEBVERExJSUFEREVRvPdpaCNNgTEG5eXlwBhDZOgHZS+QjEZjq58rigLJyclAqfdZZMaMGbX5+fmDAQAIItb2jbnQWVK70KUK8Kp2IWAuYOcrSEpKAkJI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";

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
