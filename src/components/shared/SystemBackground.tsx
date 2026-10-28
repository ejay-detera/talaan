"use client";

import React from "react";
import ShapeGrid from "@/components/shared/ShapeGrid";

/**
 * SystemBackground
 *
 * Renders the living interactive accounting grid canvas background
 * across the entire application (matching the landing page atmosphere).
 */
export function SystemBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 select-none overflow-hidden"
      aria-hidden="true"
    >
      <ShapeGrid
        shape="square"
        direction="diagonal"
        lineColor="#C8D4B8"
        hover={false}
        clickCascade={false}
        hoverColor="#C8D4B8"
        hoverFillColor="transparent"
        fillOpacity={0}
        cellSize={40}
        speed={0.15}
        glow={0}
        fade={0}
        backgroundColor="transparent"
      />
      {/* 30% opacity paper overlay on top of grid */}
      <div className="absolute inset-0 bg-paper/30 pointer-events-none" />
    </div>
  );
}

