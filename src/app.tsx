import * as React from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import * as mqtt from 'mqtt';

export class App extends React.Component<any, any> {

    private client: mqtt.MqttClient;

    constructor(props: any) {
        super(props);
        this.state = {
            url: '',
            jwtToken: '',
            topic: '',
            connected: false,
            data: []
        };
    }

    handleUrlChange = (event: any) => this.setState({url: event.target.value});
    handleJwtTokenChange = (event: any) => this.setState({jwtToken: event.target.value});
    handleTopicChange = (event: any) => this.setState({topic: event.target.value});

    handleClick = () => {
        let options = {
            servername: this.state.url,
            username: 'openHAB',
            clientId: 'openHAB',
            password: this.state.jwtToken
        };
        this.client = mqtt.connect(`mqtts://${this.state.url}:8883`, options);

        this.client.on('connect', () => {
            this.setState({connected: true});
            this.client.subscribe(this.state.topic);
            console.log('connected');
        });

        this.client.on('message', (topic, message) => {
            this.setState(prevState => ({
                data: [...prevState.data, {id: prevState.data.length + 1, topic: topic, payload: message}]
            }));
        });
    };

    render() {
        return (
            <div style={{margin: 20}}>
                <Grid container spacing={24}>
                    <Grid item xs={4}>
                        <TextField id='url' label='URL' margin='normal' onChange={this.handleUrlChange}/>
                    </Grid>
                    <Grid item xs={4}>
                        <TextField id='jwtToken' label='JWT Token' margin='normal' onChange={this.handleJwtTokenChange}/>
                    </Grid>
                    <Grid item xs={4}>
                        <TextField id='topic' label='Topic' margin='normal' onChange={this.handleTopicChange}/>
                    </Grid>
                    <Grid container spacing={24}>
                        <Grid item xs={4}>
                            <Button disabled={this.state.connected} variant='contained' color='primary' onClick={this.handleClick}> Connect </Button>
                        </Grid>
                    </Grid>
                    <Grid container spacing={24}>
                        <Grid item xs={12}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Topic</TableCell>
                                        <TableCell>Payload</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {this.state.data.map((n: any) => {
                                        return (
                                            <TableRow key={n.id}>
                                                <TableCell component='th' scope='row'>{n.topic}</TableCell>
                                                <TableCell>{n.payload}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </Grid>
                    </Grid>
                </Grid>
            </div>
        );
    }
}
