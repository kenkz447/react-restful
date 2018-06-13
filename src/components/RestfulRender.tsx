import React from 'react';
import { Resource, ResourceParameters } from '../utilities';

export interface RestfulComponentRenderProps<DataModel> {
    data?: DataModel;
    error?: Error;
}

export interface RestfulRenderProps<DataModel, ResponseModel> {
    resource: Resource<DataModel, ResponseModel>;
    parameters: Array<ResourceParameters>;
    render(props: RestfulComponentRenderProps<DataModel>): React.ReactNode;
}

export class RestfulRender<DataModel, ResponseModel> extends React.PureComponent<
    RestfulRenderProps<DataModel, ResponseModel>,
    RestfulComponentRenderProps<DataModel>> {

    state = {};

    async componentDidMount(): Promise<void> {
        try {
            const fetchResult: DataModel = await this.props.resource.fetch(this.props.parameters);
            this.setState({ data: fetchResult });
        } catch (error) {
            this.setState({ error: error });
        }
    }

    render() {
        return this.props.render(this.state);
    }
}