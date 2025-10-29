'use client'
import React from "react";
import { useCoverStore } from "@/lib/cover-store";

interface CoverPreviewProps {
  aiPreview?: string;
}

export default function CoverPreview({ aiPreview = '' }: CoverPreviewProps) {
  const { recipientName, letterBody, applicantName } = useCoverStore();

  // Show AI preview when available (before applying), otherwise show form content
  // Prioritize aiPreview || letterBody (AI preview takes precedence, then form content)
  const previewSource = (aiPreview && aiPreview.trim()) ? aiPreview : (letterBody || "Your cover letter body will appear here...");
  
  // Build greeting from recipientName
  const greetName = recipientName?.trim() || "Hiring Manager";
  
  // Build signature from applicantName
  const signatureName = applicantName?.trim() || "Your Name";

  return (
    <div className="cover-page">
      <div className="whitespace-pre-wrap leading-relaxed">
        {/* Greeting */}
        <p className="mb-4">Dear {greetName},</p>
        
        {/* Body */}
        <div className="whitespace-pre-wrap break-words">
          {previewSource}
        </div>
        
        {/* Signature */}
        <div className="mt-8">
          <p className="mb-2">Sincerely,</p>
          <p>{signatureName}</p>
        </div>
      </div>
    </div>
  );
}
