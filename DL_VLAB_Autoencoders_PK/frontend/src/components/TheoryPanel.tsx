"use client";

import React from "react";

export default function TheoryPanel() {
  return (
    <div className="bg-white border rounded-lg p-6 space-y-6">
      <section>
        <h4 className="text-lg font-semibold text-[#3399cc]">Objective</h4>
        <p className="text-sm text-gray-700 mt-2 leading-relaxed">
          This experiment demonstrates denoising autoencoders for medical
          imaging noise reduction. The goal is to reconstruct a clean scan from
          noisy input while preserving diagnostic structures.
        </p>
      </section>

      <section>
        <h4 className="text-lg font-semibold text-[#3399cc]">Theory</h4>
        <ul className="list-disc pl-5 mt-2 space-y-2 text-sm text-gray-700">
          <li>
            A denoising autoencoder learns an encoder-decoder mapping from noisy
            images to clean images.
          </li>
          <li>
            The encoder compresses input into latent features; the decoder
            reconstructs high-quality output.
          </li>
          <li>
            In CT/MRI workflows, denoising can improve perceptual clarity for
            downstream clinical interpretation.
          </li>
        </ul>
      </section>

      <section>
        <h4 className="text-lg font-semibold text-[#3399cc]">Observations</h4>
        <ul className="list-disc pl-5 mt-2 space-y-2 text-sm text-gray-700">
          <li>
            Higher injected noise typically lowers reconstruction quality and
            reduces PSNR and SSIM.
          </li>
          <li>
            Higher latent dimensions generally improve capacity to preserve fine
            structures.
          </li>
          <li>
            Validation loss trends indicate whether the model generalizes or
            starts overfitting.
          </li>
        </ul>
      </section>
    </div>
  );
}
