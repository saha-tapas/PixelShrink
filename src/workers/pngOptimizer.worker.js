import optimise from '@jsquash/oxipng/optimise';

self.onmessage = async (event) => {
  let inputDiagnostics = null;

  try {
    const source = event.data.buffer;
    const inputBytes = source instanceof ArrayBuffer
      ? new Uint8Array(source)
      : new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
    const input = inputBytes.byteOffset === 0 && inputBytes.byteLength === inputBytes.buffer.byteLength
      ? inputBytes.buffer
      : inputBytes.slice().buffer;
    const level = Number.isInteger(event.data.level) && event.data.level >= 1 && event.data.level <= 4
      ? event.data.level
      : 4;
    const firstEightBytes = Array.from(new Uint8Array(input, 0, Math.min(8, input.byteLength)))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join(' ');
    const isPngSignature = firstEightBytes === '89 50 4e 47 0d 0a 1a 0a';
    inputDiagnostics = {
      effort: event.data.effort,
      inputByteLength: input.byteLength,
      inputType: input.constructor.name,
      firstEightBytes,
      isPngSignature,
      level,
      requestId: event.data.requestId,
    };

    console.debug('PNG optimization worker started:', {
      effort: event.data.effort,
      level,
      requestId: event.data.requestId,
    });
    console.debug('PNG optimization input:', inputDiagnostics);

    const optimized = await optimise(input, {
      level,
      interlace: false,
      optimiseAlpha: false,
    });

    const output = new Uint8Array(optimized);

    const buffer = output.slice().buffer;

    self.postMessage(
      { success: true, buffer, diagnostics: inputDiagnostics },
      [buffer]
    );
  } catch (error) {
    self.postMessage({
      success: false,
      diagnostics: {
        errorCause: error?.cause ?? null,
        errorMessage: error?.message || 'PNG optimization failed',
        errorName: error?.name || 'Error',
        errorStack: error?.stack || null,
        inputDiagnostics,
      },
    });
  }
};
