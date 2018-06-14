import React from 'react';
import { Resource, ResourceParameters, State, Environment } from '../utilities';

export interface RestfulComponentRenderProps<DataModel> {
    data?: DataModel | null;
    error?: Error | null;
}

export interface RestfulRenderProps<DataModel = {}> {
    environment: Environment;
    resource: Resource<DataModel>;
    parameters: Array<ResourceParameters>;
    render(props: RestfulComponentRenderProps<DataModel>): React.ReactNode;
}
export interface RestfulRenderState<DataModel = {}> extends RestfulRenderProps<DataModel> {
    componentRenderProps: RestfulComponentRenderProps<DataModel>;
}

export class RestfulRender extends React.PureComponent<RestfulRenderProps, RestfulRenderState> {
    static getDerivedStateFromProps<DataModel>(
        nextProps: RestfulRenderProps<DataModel>,
        prevState: RestfulRenderState<DataModel>): RestfulRenderState<DataModel> | null {
        if (nextProps.resource !== prevState.resource ||
            nextProps.render !== prevState.render ||
            nextProps.parameters !== prevState.parameters
        ) {

            return {
                ...nextProps,
                componentRenderProps: prevState.componentRenderProps
            };
        }

        return null;
    }

    constructor(props: RestfulRenderProps) {
        super(props);
        props.resource.setEnvironment(props.environment);
        this.state = {
            ...props,
            componentRenderProps: {
                data: null,
                error: null
            }
        };
    }

    componentDidMount() {
        this.refresh(this.state.resource, this.state.parameters);
    }

    render() {
        console.log(this.state.componentRenderProps);
        return this.props.render(this.state.componentRenderProps);
    }

    async refresh(resource: Resource, parameters: ResourceParameters[]): Promise<void> {
        try {
            this.setState({
                componentRenderProps: {
                    data: [{}]
                }
            });
        } catch (error) {
            this.setState({
                componentRenderProps: {
                    error: error
                }
            });
        }
    }
}