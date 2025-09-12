import React, { useEffect, useRef, useState } from "react";
import axios from 'axios';
import { Circle, Group, Image, Layer, Line, Rect, Stage, Text } from "react-konva";
import { Spin } from "antd";
import { router } from "@inertiajs/react";

axios.defaults.withCredentials = true; // cookie auth

export default function TableOrder() {

    const [getFloors, setGetFloors] = useState([]);
    const [getTables, setGetTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);

    const stageRef = useRef();
    const GRID_SIZE = 20;
    const [canvasSize, setCanvasSize] = useState({ width: 1160, height: window.innerHeight * 0.85 });
    const [selectedId, setSelectedId] = useState('');
    const [selectedShape, setSelectedShape] = useState(null);
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [guides, setGuides] = useState([]);
    const [shapes, setShapes] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [mergeMode, setMergeMode] = useState(false);
    const [labelInput, setLabelInput] = useState('');
    const [paxInput, setPaxInput] = useState(2);
    const [colorInput, setColorInput] = useState('');
    const [availableColor, setAvailableColor] = useState("#FCFCFC");
    const [inUseColor, setIsUserColor] = useState("#FCFCFC");
    const [reservedColor, setReservedColor] = useState("#FCFCFC");
    const [selectedFloor, setSelectedFloor] = useState();
    const [isLoading, setIsLoading] = useState(false);

    const fetchfloor = async () => {
        try {

            const response = await axios.get('/api/floor_table_layout/getFloors');

            setGetFloors(response.data.floors);
            
        } catch (error) {
            console.error('error', error);
        }
    }

    const fetchFloorPlan = async () => {
        setIsLoading(true);
        try {
            
            const response = await axios.get('/api/floor_table_layout/getFloorPlans', {
                params: { selectedFloor }
            })

            setShapes(response.data.floorPlan);
            setGetTables(response.data.table);

        } catch (error) {
            console.error('error', error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchfloor();
    }, [])

    useEffect(() => {
        if (getFloors && getFloors.length > 0) {
            setSelectedFloor(getFloors[0].id); // store ID only
        }
    }, [getFloors]);

    useEffect(() => {
        if (selectedFloor) {
            fetchFloorPlan();
        }
    }, [selectedFloor])


    const selectFloor = (floorId) => {
        setSelectedFloor(floorId);
    };

    const tableColorState = getFloors?.find(item => item.id === selectedFloor);

    const handleSelect = async (tableId, e) => {

        const selectedTable = getTables?.find(table => table.table_id === tableId.table_id);

        setSelectedId(tableId.table_id);
        setSelectedTable(selectedTable)

        try {
            
            const response = await axios.post('/api/update-table', {
                table_id: selectedTable.table_id,
                table_layout_id: selectedTable.table_layout_id,
            })

            // go to order page with inertia instead of hard reload
            router.visit(`/order?table_id=${selectedTable.table_id}&table_layout_id=${selectedTable.table_layout_id}`);

        } catch (error) {
            console.error('error', error);

        }
        
        // if (mergeMode) {
        //     setSelectedIds(prev =>
        //         prev.includes(tableId.table_id)
        //             ? prev.filter(id => id !== tableId.table_id)
        //             : [...prev, tableId.table_id]
        //     );
        // } else {
        //     setSelectedId(tableId.table_id);
        //     setSelectedShape(tableId.type);
        //     const shape = shapes.find(s => s.table_id === tableId.table_id);
        //     if (shape) {
        //         setLabelInput(shape.label);
        //         setPaxInput(shape.pax);
        //         setColorInput(shape.color);
        //     }
        // }
    };

    useEffect(() => {
        if (window.Echo) {
            window.Echo.private('floor-tables')
            .listen('.TableStatus', (e) => {
                const updatedTable = e.tables; // correct property

                // Update that table in state
                setGetTables((prev) =>
                    prev.map(t => t.table_id === updatedTable.table_id ? updatedTable : t)
                );
            });
        }
    }, []);

    return (
        <div className="w-full relative bg-white">
            {/* table status */}
            <div className="absolute z-30 top-5 left-5 flex items-center gap-4 py-2 px-4 bg-white border border-neutral-25 shadow-sec-voucher rounded-lg" >
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: tableColorState?.available_color }}></div>
                    <div className="text-neutral-900 text-sm font-medium">Available: {}</div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: tableColorState?.in_use_color }}></div>
                    <div className="text-neutral-900 text-sm font-medium">In Use: {}</div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: tableColorState?.reserved_color }}></div>
                    <div className="text-neutral-900 text-sm font-medium">Reserved: {}</div>
                </div>
            </div>
            {/* floor s */}
            <div className="absolute z-30 top-5 right-8 flex items-center gap-3" >
                {
                    getFloors && getFloors.length > 0 && (
                        <div className="flex flex-row gap-3 max-w-[400px] overflow-x-auto">
                            {
                                getFloors.map((floor) => (
                                    <div key={floor.id} className={`${selectedFloor === floor.id ? 'bg-neutral-50 text-neutral-900' : 'bg-neutral-25 text-neutral-300'} flex items-center py-2 px-4 rounded-xl text-sm font-medium text-nowrap cursor-pointer`}
                                        onClick={() => selectFloor(floor.id)}
                                    >
                                        {floor.name}
                                    </div>
                                ))
                            }
                        </div>
                    )
                }
            </div>

            {
                !isLoading && shapes ? (
                    <div className="flex max-h-[90vh] w-full overflow-scroll">
                        <Stage
                            ref={stageRef}
                            width={canvasSize.width}
                            height={canvasSize.height}
                            onMouseDown={e => {
                                // Deselect if clicked on empty space (the stage itself)
                                if (e.target === e.target.getStage()) {
                                setSelectedId('');
                                setSelectedTable(null);
                                }
                            }}
                        >
                            <Layer>
                                {
                                    backgroundImage ? (
                                        <Image 
                                            image={backgroundImage}
                                            x={0}
                                            y={0}                       
                                            width={canvasSize.width}
                                            height={canvasSize.height}
                                            listening={false}
                                            keepRatio={true}
                                        />
                                    ) : (
                                        <>
                                            {
                                                [...Array(Math.ceil(canvasSize.width / GRID_SIZE)).keys()].map(i => (
                                                    <Line
                                                        key={`v-${i}`}
                                                        points={[i * GRID_SIZE, 0, i * GRID_SIZE, window.innerHeight]}
                                                        stroke="#F0F0F3"
                                                        strokeWidth={0.34}
                                                    />
                                                ))}
                                                {[...Array(Math.ceil(canvasSize.height / GRID_SIZE)).keys()].map(i => (
                                                    <Line
                                                        key={`h-${i}`}
                                                        points={[0, i * GRID_SIZE, window.innerWidth, i * GRID_SIZE]}
                                                        stroke="#F0F0F3"
                                                        strokeWidth={0.34}
                                                    />
                                                ))
                                            }
                                        </>
                                    )
                                }
                                {/* Guides */}
                                {
                                    guides.map((guide, i) => (
                                        <Line
                                            key={`guide-${i}`}
                                            points={guide.points}
                                            stroke={guide.color}
                                            strokeWidth={0.5}
                                            dash={[4, 4]}
                                        />
                                    ))
                                }
                            </Layer>
                            <Layer>
                                {/* Shapes */}
                                {
                                    shapes && shapes.length > 0 ? (
                                        <>
                                            {
                                                shapes.map((shape, index) => (
                                                    <Group
                                                        key={shape.table_id}
                                                        id={shape.table_id}
                                                        x={shape.x}
                                                        y={shape.y}
                                                        rotation={shape.rotation}
                                                        offsetX={shape.type === 'circle' ? 0 : shape.width / 2}
                                                        offsetY={shape.type === 'circle' ? 0 : shape.height / 2}
                                                        draggable={selectedId === shape.table_id}
                                                        onClick={(e) => handleSelect(shape, e)}
                                                        onTap={(e) => handleSelect(shape, e)}
                                                        onDragMove={(e) => handleDragMove(e, index)}
                                                        onDragEnd={() => setGuides([])}
                                                        onTransformEnd={(e) => handleTransformEnd(e, index)}
                                                    >
                                                        {
                                                            shape.type === 'circle' ? (
                                                                <Circle
                                                                    radius={shape.radius}
                                                                    fill={
                                                                    selectedIds.includes(shape.table_id)
                                                                        ? "#FFF"
                                                                        : (() => {
                                                                            const table = getTables.find(t => t.table_id === shape.table_id);
                                                                            if (!table) return shape.color;

                                                                            switch (table.status) {
                                                                            case 'available': return table.available_color;
                                                                            case 'occupied': return table.in_use_color;
                                                                            case 'reserved': return table.reserved_color;
                                                                            default: return shape.color;
                                                                            }
                                                                        })()
                                                                    }
                                                                    stroke={
                                                                        mergeMode ? (selectedIds.includes(shape.table_id) ? "#F26522" : "#E4E4E7")
                                                                            : (selectedId === shape.table_id ? "#F26522" : "#E4E4E7")
                                                                    }                                                            
                                                                    strokeWidth={1}
                                                                />
                                                            ) : (
                                                                <Rect
                                                                    width={shape.width}
                                                                    height={shape.height}
                                                                    fill={
                                                                    selectedIds.includes(shape.table_id)
                                                                        ? "#FFF"
                                                                        : (() => {
                                                                            const table = getTables.find(t => t.table_id === shape.table_id);
                                                                            if (!table) return shape.color;

                                                                            switch (table.status) {
                                                                            case 'available': return table.available_color;
                                                                            case 'occupied': return table.in_use_color;
                                                                            case 'reserved': return table.reserved_color;
                                                                            default: return shape.color;
                                                                            }
                                                                        })()
                                                                    }
                                                                    stroke={
                                                                        mergeMode? (selectedIds.includes(shape.table_id) ? "#F26522" : "#E4E4E7")
                                                                            : (selectedId === shape.table_id ? "#F26522" : "#E4E4E7")
                                                                    }
                                                                    strokeWidth={1}
                                                                    cornerRadius={12}
                                                                />
                                                            )
                                                        }
                                                        <Text
                                                            text={shape.label || ''}
                                                            fontSize={14}
                                                            fill="black"
                                                            align="center"
                                                            verticalAlign="middle"
                                                            width={shape.type === 'circle' ? shape.radius * 2 : shape.width}
                                                            height={shape.type === 'circle' ? shape.radius * 2 : shape.height}
                                                            x={shape.type === 'circle' ? 0 : shape.width / 2}
                                                            y={shape.type === 'circle' ? 0 : shape.height / 2}
                                                            offsetX={shape.type === 'circle' ? shape.radius : shape.width / 2}
                                                            offsetY={shape.type === 'circle' ? shape.radius : shape.height / 2}
                                                            rotation={-(shape.rotation || 0)}
                                                            listening={false}
                                                        />
                                                        <Text
                                                            text={shape.pax || ''}
                                                            fontSize={12}
                                                            fill="gray"
                                                            align="center"
                                                            verticalAlign="middle"
                                                            width={shape.type === 'circle' ? shape.radius * 2 : shape.width}
                                                            height={shape.type === 'circle' ? shape.radius * 2 : shape.height+40}
                                                            x={shape.type === 'circle' ? 0 : shape.width / 2}
                                                            y={shape.type === 'circle' ? 20 : shape.height / 2}
                                                            offsetX={shape.type === 'circle' ? shape.radius : shape.width / 2}
                                                            offsetY={shape.type === 'circle' ? shape.radius : shape.height / 2}
                                                            rotation={-(shape.rotation || 0)}
                                                            listening={false}
                                                        />
                                                    </Group>
                                                ))
                                            }
                                        </>
                                    ) : null
                                }
                            </Layer>
                        </Stage>
                    </div>
                ) : (
                    <div className="w-full h-[580px] flex justify-center items-center">
                        <Spin size="large" />
                    </div>
                )
            }
        </div>
    )
}