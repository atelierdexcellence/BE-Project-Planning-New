import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Save, Palette, Type, Eraser, RotateCcw, Download, Pen, Square, Circle, ArrowRight } from 'lucide-react';

interface PhotoEditorProps {
  imageUrl: string;
  caption?: string;
  onSave: (editedImageUrl: string, caption: string) => void;
  onCancel: () => void;
}

interface DrawingPoint {
  x: number;
  y: number;
}

interface DrawingStroke {
  points: DrawingPoint[];
  color: string;
  width: number;
  tool: 'pen' | 'eraser';
}

interface TextAnnotation {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
}

interface Shape {
  id: string;
  type: 'rectangle' | 'circle' | 'arrow';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  width: number;
}

export const PhotoEditor: React.FC<PhotoEditorProps> = ({ 
  imageUrl, 
  caption = '', 
  onSave, 
  onCancel 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<DrawingPoint[]>([]);
  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([]);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [photoCaption, setPhotoCaption] = useState(caption);
  
  // Drawing tools state
  const [activeTool, setActiveTool] = useState<'pen' | 'eraser' | 'text' | 'rectangle' | 'circle' | 'arrow'>('pen');
  const [brushColor, setBrushColor] = useState('#FF0000');
  const [brushWidth, setBrushWidth] = useState(3);
  const [fontSize, setFontSize] = useState(16);
  
  // Text annotation state
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInputPosition, setTextInputPosition] = useState({ x: 0, y: 0 });
  const [textInputValue, setTextInputValue] = useState('');
  
  // Shape drawing state
  const [isDrawingShape, setIsDrawingShape] = useState(false);
  const [shapeStart, setShapeStart] = useState({ x: 0, y: 0 });

  const colors = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#FFA500', '#800080', '#FFC0CB', '#000000', '#FFFFFF', '#808080'
  ];

  useEffect(() => {
    if (imageLoaded) {
      redrawCanvas();
    }
  }, [strokes, textAnnotations, shapes, imageLoaded]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    redrawCanvas();
  }, []);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !imageLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to maintain aspect ratio
    const maxWidth = 800;
    const maxHeight = 600;
    
    let canvasWidth = image.naturalWidth;
    let canvasHeight = image.naturalHeight;
    
    // Scale down if image is too large
    if (canvasWidth > maxWidth || canvasHeight > maxHeight) {
      const aspectRatio = canvasWidth / canvasHeight;
      
      if (aspectRatio > 1) {
        // Landscape
        canvasWidth = Math.min(canvasWidth, maxWidth);
        canvasHeight = canvasWidth / aspectRatio;
      } else {
        // Portrait
        canvasHeight = Math.min(canvasHeight, maxHeight);
        canvasWidth = canvasHeight * aspectRatio;
      }
    }
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw image maintaining aspect ratio
    ctx.drawImage(image, 0, 0, canvasWidth, canvasHeight);

    // Draw all strokes
    strokes.forEach(stroke => {
      if (stroke.points.length < 2) return;
      
      ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      
      ctx.stroke();
    });

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';

    // Draw shapes
    shapes.forEach(shape => {
      ctx.strokeStyle = shape.color;
      ctx.lineWidth = shape.width;
      ctx.fillStyle = 'transparent';
      
      switch (shape.type) {
        case 'rectangle':
          ctx.strokeRect(
            shape.startX, 
            shape.startY, 
            shape.endX - shape.startX, 
            shape.endY - shape.startY
          );
          break;
        case 'circle':
          const radius = Math.sqrt(
            Math.pow(shape.endX - shape.startX, 2) + Math.pow(shape.endY - shape.startY, 2)
          );
          ctx.beginPath();
          ctx.arc(shape.startX, shape.startY, radius, 0, 2 * Math.PI);
          ctx.stroke();
          break;
        case 'arrow':
          drawArrow(ctx, shape.startX, shape.startY, shape.endX, shape.endY, shape.color, shape.width);
          break;
      }
    });

    // Draw text annotations
    textAnnotations.forEach(annotation => {
      ctx.font = `${annotation.fontSize}px Arial`;
      ctx.fillStyle = annotation.color;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      
      // Draw text outline for better visibility
      ctx.strokeText(annotation.text, annotation.x, annotation.y);
      ctx.fillText(annotation.text, annotation.x, annotation.y);
    });
  }, [strokes, textAnnotations, shapes, imageLoaded]);

  const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, color: string, width: number) => {
    const headLength = 15;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    
    // Draw line
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    
    // Draw arrowhead
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle - Math.PI / 6),
      toY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle + Math.PI / 6),
      toY - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  };

  const getCanvasCoordinates = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const coords = getCanvasCoordinates(e);
    
    if (activeTool === 'text') {
      setTextInputPosition(coords);
      setShowTextInput(true);
      return;
    }
    
    if (['rectangle', 'circle', 'arrow'].includes(activeTool)) {
      setIsDrawingShape(true);
      setShapeStart(coords);
      return;
    }
    
    if (activeTool === 'pen' || activeTool === 'eraser') {
      setIsDrawing(true);
      setCurrentStroke([coords]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const coords = getCanvasCoordinates(e);
    
    if (isDrawingShape) {
      // Preview shape while drawing
      redrawCanvas();
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx) return;
      
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushWidth;
      
      switch (activeTool) {
        case 'rectangle':
          ctx.strokeRect(
            shapeStart.x, 
            shapeStart.y, 
            coords.x - shapeStart.x, 
            coords.y - shapeStart.y
          );
          break;
        case 'circle':
          const radius = Math.sqrt(
            Math.pow(coords.x - shapeStart.x, 2) + Math.pow(coords.y - shapeStart.y, 2)
          );
          ctx.beginPath();
          ctx.arc(shapeStart.x, shapeStart.y, radius, 0, 2 * Math.PI);
          ctx.stroke();
          break;
        case 'arrow':
          drawArrow(ctx, shapeStart.x, shapeStart.y, coords.x, coords.y, brushColor, brushWidth);
          break;
      }
      return;
    }
    
    if (isDrawing && (activeTool === 'pen' || activeTool === 'eraser')) {
      setCurrentStroke(prev => [...prev, coords]);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDrawingShape) {
      const coords = getCanvasCoordinates(e);
      const newShape: Shape = {
        id: Date.now().toString(),
        type: activeTool as 'rectangle' | 'circle' | 'arrow',
        startX: shapeStart.x,
        startY: shapeStart.y,
        endX: coords.x,
        endY: coords.y,
        color: brushColor,
        width: brushWidth
      };
      setShapes(prev => [...prev, newShape]);
      setIsDrawingShape(false);
      return;
    }
    
    if (isDrawing && currentStroke.length > 0) {
      const newStroke: DrawingStroke = {
        points: currentStroke,
        color: brushColor,
        width: brushWidth,
        tool: activeTool as 'pen' | 'eraser'
      };
      setStrokes(prev => [...prev, newStroke]);
      setCurrentStroke([]);
      setIsDrawing(false);
    }
  };

  const handleTextSubmit = () => {
    if (textInputValue.trim()) {
      const newAnnotation: TextAnnotation = {
        id: Date.now().toString(),
        x: textInputPosition.x,
        y: textInputPosition.y,
        text: textInputValue.trim(),
        color: brushColor,
        fontSize: fontSize
      };
      setTextAnnotations(prev => [...prev, newAnnotation]);
    }
    setShowTextInput(false);
    setTextInputValue('');
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all annotations?')) {
      setStrokes([]);
      setTextAnnotations([]);
      setShapes([]);
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const editedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
    onSave(editedImageUrl, photoCaption);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'annotated-photo.jpg';
    link.href = canvas.toDataURL('image/jpeg', 0.9);
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{t('photo.edit_annotate')}</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 px-3 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>{t('photo.download')}</span>
            </button>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {t('photo.save')}
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row max-h-[calc(95vh-200px)] overflow-hidden">
          {/* Tools Panel */}
          <div className="w-full lg:w-64 p-4 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50 overflow-y-auto">
            <div className="space-y-4">
              {/* Drawing Tools */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">{t('photo.drawing_tools')}</h4>
                <div className="grid grid-cols-3 lg:grid-cols-1 gap-2">
                  <button
                    onClick={() => setActiveTool('pen')}
                    className={`flex items-center space-x-2 p-3 rounded-md transition-colors ${
                      activeTool === 'pen' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Pen className="w-4 h-4" />
                    <span className="hidden lg:inline">{t('photo.pen')}</span>
                  </button>
                  <button
                    onClick={() => setActiveTool('eraser')}
                    className={`flex items-center space-x-2 p-3 rounded-md transition-colors ${
                      activeTool === 'eraser' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Eraser className="w-4 h-4" />
                    <span className="hidden lg:inline">{t('photo.eraser')}</span>
                  </button>
                  <button
                    onClick={() => setActiveTool('text')}
                    className={`flex items-center space-x-2 p-3 rounded-md transition-colors ${
                      activeTool === 'text' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Type className="w-4 h-4" />
                    <span className="hidden lg:inline">{t('photo.text')}</span>
                  </button>
                </div>
              </div>

              {/* Shape Tools */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">{t('photo.shapes')}</h4>
                <div className="grid grid-cols-3 lg:grid-cols-1 gap-2">
                  <button
                    onClick={() => setActiveTool('rectangle')}
                    className={`flex items-center space-x-2 p-3 rounded-md transition-colors ${
                      activeTool === 'rectangle' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Square className="w-4 h-4" />
                    <span className="hidden lg:inline">{t('photo.rectangle')}</span>
                  </button>
                  <button
                    onClick={() => setActiveTool('circle')}
                    className={`flex items-center space-x-2 p-3 rounded-md transition-colors ${
                      activeTool === 'circle' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Circle className="w-4 h-4" />
                    <span className="hidden lg:inline">{t('photo.circle')}</span>
                  </button>
                  <button
                    onClick={() => setActiveTool('arrow')}
                    className={`flex items-center space-x-2 p-3 rounded-md transition-colors ${
                      activeTool === 'arrow' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span className="hidden lg:inline">{t('photo.arrow')}</span>
                  </button>
                </div>
              </div>

              {/* Color Palette */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">{t('photo.colors')}</h4>
                <div className="grid grid-cols-6 lg:grid-cols-4 gap-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setBrushColor(color)}
                      className={`w-8 h-8 rounded-md border-2 transition-all ${
                        brushColor === color ? 'border-gray-800 scale-110' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={brushColor}
                  onChange={(e) => setBrushColor(e.target.value)}
                  className="w-full mt-2 h-8 rounded border border-gray-300"
                />
              </div>

              {/* Brush Settings */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">{t('photo.brush_size')}</h4>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={brushWidth}
                  onChange={(e) => setBrushWidth(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1px</span>
                  <span>{brushWidth}px</span>
                  <span>20px</span>
                </div>
              </div>

              {/* Text Settings */}
              {activeTool === 'text' && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">{t('photo.text_size')}</h4>
                  <input
                    type="range"
                    min="12"
                    max="48"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>12px</span>
                    <span>{fontSize}px</span>
                    <span>48px</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={handleClearAll}
                  className="w-full flex items-center justify-center space-x-2 p-3 text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{t('photo.clear_all')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 p-4 overflow-auto flex items-center justify-center">
            <div className="relative inline-block max-w-full max-h-full">
              <canvas
                ref={canvasRef}
                className="border border-gray-300 rounded-lg shadow-lg max-w-full max-h-full cursor-crosshair"
                style={{ 
                  maxWidth: '100%',
                  maxHeight: 'calc(95vh - 300px)',
                  objectFit: 'contain',
                  cursor: activeTool === 'eraser' ? 'grab' : 
                         activeTool === 'text' ? 'text' : 'crosshair'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => {
                  setIsDrawing(false);
                  setIsDrawingShape(false);
                }}
              />
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Edit"
                className="hidden"
                onLoad={handleImageLoad}
              />

              {/* Text Input Overlay */}
              {showTextInput && (
                <div
                  className="absolute bg-white border border-gray-300 rounded-md p-2 shadow-lg"
                  style={{
                    left: textInputPosition.x,
                    top: textInputPosition.y,
                    transform: 'translate(-50%, -100%)'
                  }}
                >
                  <input
                    type="text"
                    value={textInputValue}
                    onChange={(e) => setTextInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleTextSubmit();
                      } else if (e.key === 'Escape') {
                        setShowTextInput(false);
                        setTextInputValue('');
                      }
                    }}
                    placeholder="Enter text..."
                    className="w-48 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={() => {
                        setShowTextInput(false);
                        setTextInputValue('');
                      }}
                      className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleTextSubmit}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Caption Input */}
        <div className="p-4 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('photo.caption')}
          </label>
          <input
            type="text"
            value={photoCaption}
            onChange={(e) => setPhotoCaption(e.target.value)}
            placeholder={t('photo.caption_placeholder')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Photo
          </button>
        </div>
      </div>
    </div>
  );
};