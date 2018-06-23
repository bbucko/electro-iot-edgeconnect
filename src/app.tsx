import * as React from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Icon from '@material-ui/core/Icon';
import * as mqtt from 'mqtt';

const settings = require('electron').remote.require('electron-settings');

export class App extends React.Component<any, any> {

    private client: mqtt.MqttClient;

    constructor(props: any) {
        super(props);
        this.state = {
            url: settings.get('mqtt.url'),
            username: settings.get('mqtt.username'),
            password: settings.get('mqtt.password'),
            topic: settings.get('mqtt.topic'),
            connected: false,
            data: []
        };
    }

    handleUrlChange = (event: any) => this.setState({url: event.target.value});
    handlePasswordChange = (event: any) => this.setState({password: event.target.value});
    handleTopicChange = (event: any) => this.setState({topic: event.target.value});
    handleUsernameChange = (event: any) => this.setState({username: event.target.value});

    handleClick = () => {
        let options = {
            servername: this.state.url,
            username: this.state.username,
            clientId: this.state.username,
            password: this.state.password
        };
        this.client = mqtt.connect(`mqtts://${this.state.url}:8883`, options);

        this.client.on('connect', () => {
            this.setState({connected: true});
            this.client.subscribe(this.state.topic);
            console.log('connected');
        });

        this.client.on('message', (topic, message) => {
            console.log(`msg: ${message} on topic: ${topic}`);
            this.setState(prevState => ({
                data: [...prevState.data, {id: prevState.data.length + 1, topic: topic, payload: `${message}`}]
            }));
        });

        settings.set('mqtt', {
            url: this.state.url,
            username: this.state.username,
            password: this.state.password,
            topic: this.state.topic,
        });
    };

    render() {
        return (
            <div>
                <Grid container spacing={16}>
                    <Grid item xs={4}>
                        <TextField fullWidth={true} label='URL' value={this.state.url} onChange={this.handleUrlChange}/>
                    </Grid>
                    <Grid item xs={4}>
                        <TextField fullWidth={true} label='Topic' value={this.state.topic} onChange={this.handleTopicChange}/>
                    </Grid>
                </Grid>

                <Grid container spacing={16}>
                    <Grid item xs={4}>
                        <TextField fullWidth={true} label='Username' value={this.state.username} onChange={this.handleUsernameChange}/>
                    </Grid>
                    <Grid item xs={4}>
                        <TextField fullWidth={true} label='Password' value={this.state.password} onChange={this.handlePasswordChange}/>
                    </Grid>
                </Grid>

                <Grid container spacing={16} alignItems={'center'}>
                    <Grid item xs={2}>
                        <Button disabled={this.state.connected} variant='contained' color='primary' onClick={this.handleClick}>Connect</Button>
                    </Grid>
                    <Grid item xs={1}>
                        <Icon>{this.state.connected ? 'phonelink' : 'phonelink_off'}</Icon>
                    </Grid>
                </Grid>

                <Grid container spacing={16}>
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
            </div>
        );
    }
}
