import React, { useState, useEffect, useContext } from 'react'

import Card from 'react-bootstrap/Card'
import TabPane from 'react-bootstrap/TabPane'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
dayjs.extend(localizedFormat);

import { MapContainer, TileLayer, Circle, useMap } from 'react-leaflet'

import { SettingsContext } from '../../context/settingsContext'
import { unitConverter } from '../../helpers/convert'

const UpdateCenterView = ({ center }) => {
    const map = useMap();
  
    useEffect(() => {
      map.setView(center, 13);
    }, [center, map]);
  
    return null;
};

const batteryIcon = (device) => {
    if (device.voltage === 'N/A' || !device.active)
        return <><i className='bi bi-battery text-muted' /> N/A</>;
    else if (device.voltage > 3.3)
        return <><i className='bi bi-battery-half text-muted' /> {device.voltage.toLocaleString()} V</>;
    else if (device.voltage > 3.8)
        return <><i className='bi bi-battery-full text-muted' /> {device.voltage.toLocaleString()} V</>;
    else
        return <><i className='bi bi-battery text-muted' /> N/A</>;
}

export default function TabStation(props) {

    const [state] = useContext(SettingsContext);

    const [device, setDevice] = useState({
        device_id: "N/A",
        description: "N/A",
        location: {
            lat: 0,
            lng: 0,
            alt: 0,
            elevation_unit: "[m]",
            timezone: "UTC"
        },
        voltage: "N/A",
        active: false
    });
    const [statistics, setStatistics] = useState({
        measurements: "N/A",
        days: "N/A",
        latest: "N/A",
        start: "N/A",
        size: "N/A"
    });

    useEffect(() => {
        let size = {}
        if (props.statistics !== undefined) {
            let sizearr = props.statistics.size.split(' ');
            size = { 'size': `${Number(sizearr[0]).toLocaleString()} ${sizearr[1]}` }
        }
        setStatistics(statistics => { return { ...statistics, ...props.statistics, ...size } })
    }, [props.statistics])

    useEffect(() => {
        setDevice(device => { return { ...device, ...props.device } })
    }, [props.device])

    return (
        <TabPane eventKey='station' mountOnEnter={true}>
            <Card>
                <Card.Body>
                    <Card.Title className='text-info'>{device.description}</Card.Title>
                    <Card.Subtitle className='small fw-light'>
                        <ul className='list-inline mb-0'>
                            <li className='list-inline-item pe-2' title='Station&apos;s elevation'><i className="bi-image-alt text-muted"></i> {unitConverter(device.location.alt, device.location.elevation_unit, state.units)[0].toLocaleString()} {unitConverter(device.location.alt, device.location.elevation_unit, state.units)[1]}</li>
                            <li className='list-inline-item pe-2' title='Station&apos;s battery charge'>{batteryIcon(device)}</li>
                            <li className='list-inline-item pe-2' title='Station&apos;s online status'><i className={`${device.active ? 'bi-wifi' : 'bi-wifi-off'}  text-muted`}></i> {`${device.active ? 'online' : 'offline'}`}</li>
                            <li className='list-inline-item' title='Station&apos;s Device ID'><i className="bi-upc text-muted"></i> {device.device_id}</li>
                        </ul>
                    </Card.Subtitle>
                </Card.Body>
                <MapContainer center={[device.location.lat, device.location.lng]} zoom={12} scrollWheelZoom={false} id='mapid' style={{ width: "100%", height: "200px", position: "relative", outline: "none" }}>
                    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" detectRetina={true} crossOrigin={true} />
                    <Circle center={[device.location.lat, device.location.lng]} radius={500} pathOptions={{ color: 'red', weight: 1, fillColor: '#f03', fillOpacity: 0.5 }} />
                    <UpdateCenterView center={[device.location.lat, device.location.lng]} />
                </MapContainer>
                <Card.Body>
                    <Row xs={2} className='small'>
                        <Col>
                            <strong>Data Sets</strong>
                            <p className='fw-ligher'>{statistics.measurements.toLocaleString()}</p>
                        </Col>
                        <Col>
                            <strong>Days Recorded</strong>
                            <p className='fw-ligher'>{statistics.days.toLocaleString()}</p>
                        </Col>
                        <Col>
                            <strong>Latest Entry</strong>
                            <p className='fw-ligher'>{statistics.latest !== "N/A" ? dayjs(statistics.latest).format('L LT') : "N/A"}</p>
                        </Col>
                        <Col>
                            <strong>Start Entry</strong>
                            <p className='fw-ligher'>{statistics.start !== "N/A" ? dayjs(statistics.start).format('L LT') : "N/A"}</p>
                        </Col>
                        <Col>
                            <strong>Timezone</strong>
                            <p className='fw-ligher'>{device.location.timezone}</p>
                        </Col>
                        <Col>
                            <strong>Database Size</strong>
                            <p className='fw-ligher'>{statistics.size}</p>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </TabPane>
    )
}