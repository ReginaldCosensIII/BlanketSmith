# Instruction Engine

## Purpose
The Instruction Engine allows users to create, edit, and export text-based instructions for their patterns. It transforms project data (grid, palette, stitches) into a structured `InstructionDoc` that renders cleanly in PDF exports.

## Core Concepts

### InstructionDoc
The central data structure representing a project's instructions.
```typescript
interface InstructionDoc {
    title: string;
    blocks: InstructionBlock[];
}

type InstructionBlock = 
    | { type: 'heading', content: string[] }
    | { type: 'paragraph', content: string[] }
    | { type: 'list-ul', content: string[] }  // Bulleted
    | { type: 'list-ol', content: string[] }; // Numbered
```

### Persistence
`InstructionDoc` is persisted as a first-class citizen in the `Project` object (`project.instructionDoc`). It is saved/loaded automatically with the project file.

## Architecture

### Registry (`services/instructions/registry.ts`)
A singleton registry that provides stitch definitions. It maps Stitch IDs (e.g., 'sc', 'dc') to full metadata (Name, Abbreviation, Description).
- **Extensibility**: Designed to support hundreds of stitches.
- **Lookup**: Handles unknown stitch IDs gracefully.

### Generator (`services/instructions/generator.ts`)
A deterministic function that analyzes the project state to produce an initial `InstructionDoc`.
- **Input**: `AnyProject` (Grid, Palette, Settings).
- **Output**: `InstructionDoc` with:
    - **Materials**: Derived from Yarn Palette.
    - **Stitch Key**: Derived from used stitches in the grid.
    - **Finishing**: Generic boilerplate.
- **Philosophy**: Factual, concise, and deterministic. No "AI" guessing.

### Editor (`components/InstructionsEditorModal.tsx`)
A generic, block-based editor that allows users to modify the `InstructionDoc`.
- **Features**: Add/Edit/Delete/Reorder blocks.
- **Generation**: Users can invoke the generator from here to populate/reset instructions.
- **Safety**: Requires confirmation before overwriting existing content.

## Export Integration
The `exportService.ts` renders the `InstructionDoc` into the PDF.
- **Placement**: Immediately follows the "Materials & Stitch Key" section.
- **Orphan Guard**: Instructions will share the page with Materials if at least **140pt** of vertical space remains. Otherwise, they start on a new page.
- **Chart Isolation**: The end of the instructions section ALWAYS triggers a page break before any charts are rendered.

## Future Roadmap (Post-Beta)
- **Rich Text**: Bold/Italic support within blocks.
- **Discipline Selection**: Knitting / Cross-stitch generators.
- **Row-by-Row**: Automated row instruction generation (e.g., "Row 1: 5 SC, 2 DC...").
