import React from 'react';
import { Resource, ResourceParameters, State } from '../utilities';

export interface RestfulComponentRenderProps<DataModel> {
    data?: DataModel | null;
    error?: Error | null;
}

export interface RestfulRenderProps<DataModel> {
    resource: Resource<DataModel>;
    parameters: Array<ResourceParameters>;
    render(props: RestfulComponentRenderProps<DataModel>): React.ReactNode;
}
export interface RestfulRenderState<DataModel> extends RestfulRenderProps<DataModel> {
    componentRenderProps: RestfulComponentRenderProps<DataModel>;
}

export class RestfulRender<DataModel> extends React.PureComponent<
    RestfulRenderProps<DataModel>,
    RestfulRenderState<DataModel>> {

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

    constructor(props: RestfulRenderProps<DataModel>) {
        super(props);
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

    componentDidUpdate() {
        this.refresh(this.state.resource, this.state.parameters);
    }

    render() {
        return this.props.render(this.state.componentRenderProps);
    }

    async refresh(resource: Resource<DataModel>, parameters: ResourceParameters[]): Promise<void> {
        try {
            const data = await resource.fetch(parameters);
            this.setState({
                componentRenderProps: {
                    data
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