import { createRepository } from "@app/utils/APIService";
import { Button, ButtonVariant, Checkbox, Form, FormGroup, Modal, ModalContent, ModalVariant, Popover, TextArea, TextInput } from "@patternfly/react-core";
import { HelpIcon } from "@patternfly/react-icons";
import React, { useContext, SetStateAction, useEffect } from "react";
import { Context } from '@app/store/store';

interface IModalContext {
  isModalOpen: IModalContextMember;
  isEditRepo: IModalContextMember;
  handleModalToggle;
  data: IModalContextMember;
}

interface IModalContextMember {
  value: any
  set: SetStateAction<any>
}

export const ModalContext = React.createContext<IModalContext>({
  isModalOpen: {set: undefined, value: false},
  isEditRepo: {set: undefined, value: false},
  handleModalToggle: () => {},
  data: {set: undefined, value: false}
});

export const useModalContext = () => {
  return useContext(ModalContext)
}

export const useDefaultModalContextState = () => {
  const [isModalOpen, setModalOpen] = React.useState(false)
  const [isEditRepo, setEditRepo] = React.useState(false);
  const [data, setData] = React.useState({});
  const defaultModalContext = useModalContext()

  defaultModalContext.isModalOpen = {set: setModalOpen, value: isModalOpen}
  defaultModalContext.isEditRepo = {set: setEditRepo, value: isEditRepo}
  defaultModalContext.data = {set: setData, value: data}
  defaultModalContext.handleModalToggle = (edit : Boolean, data: any) => {
    defaultModalContext.isModalOpen.set(!defaultModalContext.isModalOpen.value)
    if(edit==true){
      defaultModalContext.isEditRepo.set(true)
      defaultModalContext.data.set(data)
    }
    else{ 
      defaultModalContext.isEditRepo.set(false)
    }
  }
  return defaultModalContext

}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const FormModal = ()=> {
    const modalContext=useModalContext()
    const [gitRepositoryValue, setGitRepositoryValue] = React.useState("");
    const [gitOrganizationValue, setGitOrganizationValue] = React.useState("");
    const [monitorGithubActions, setMonitorGithubActions] = React.useState(false);
    const [checked, setChecked] = React.useState('');
  
    const { state } = useContext(Context)

    const handleGitRepositoryInput = value => {
      setGitRepositoryValue(value);
    };
  
    const handleGitOrganizationInput = value => {
      setGitOrganizationValue(value);
    };
  
    const handleGithubActionsMonitor = value => {
      setMonitorGithubActions(value);
      setChecked(value);
    };
    
    const onUpdateSubmit = async() => {
      modalContext.handleModalToggle()
      window.location.reload();
    }

    const onCreateSubmit = async() => {
      try{
        const data = {
          git_organization: gitOrganizationValue,
          repository_name : gitRepositoryValue,
          jobs: {
            github_actions: {
              monitor: monitorGithubActions
            }
          },
          artifacts: [],
          team_name: state.Team
        }
        modalContext.handleModalToggle()
        await createRepository(data)
        window.location.reload();
      }
      catch (error) {
        console.log(error)
      }
    }

    const  onSubmit = async() => {
      !modalContext.isEditRepo.value ? onCreateSubmit() : onUpdateSubmit();
    }

    useEffect(() => {
      if(modalContext.isEditRepo.value){
        setGitRepositoryValue(modalContext.data.value.repository_name)
        setGitOrganizationValue(modalContext.data.value.git_organization)
      }
    });
  
  return (
      <React.Fragment>
        <Modal
         variant={ModalVariant.medium}
          title={ !modalContext.isEditRepo.value ? "Add new git repository" : "Update git repository" }
          description={ !modalContext.isEditRepo.value ? "Enter a new git repository to obtain information in the quality quality studio." : ""}
          isOpen={modalContext.isModalOpen.value}
          onClose={modalContext.handleModalToggle}
          actions={[
            <Button key="create" variant="primary" form="modal-with-form-form" onClick={onSubmit}>
              { !modalContext.isEditRepo.value ? "Add" : "Update" }
            </Button>,
            <Button key="cancel" variant="link" onClick={modalContext.handleModalToggle}>
              Cancel
            </Button>
          ]}
        >
         <Form isHorizontal id="modal-with-form-form">
          <FormGroup 
            label="Git Organization"
            labelIcon={
              <Popover
                headerContent={
                  <div>
                  </div>
                }
                bodyContent={
                  <div>
                    Git organization name
                  </div>
                }
              >
                <button
                  type="button"
                  aria-label="More info for name field"
                  onClick={e => e.preventDefault()}
                  aria-describedby="modal-with-form-form-name"
                  className="pf-c-form__group-label-help"
                >
                  <HelpIcon noVerticalAlign />
                </button>
              </Popover>
            }
            isRequired
            fieldId="modal-with-form-form-name">
              <TextInput
                isReadOnly={modalContext.isEditRepo.value}
                isRequired
                type="email"
                id="modal-with-form-form-name"
                name="modal-with-form-form-name"
                value={gitOrganizationValue}
                onChange={handleGitOrganizationInput}
              />
          </FormGroup>
          <FormGroup 
            label="Repository name"
            labelIcon={
              <Popover
                headerContent={
                  <div>
                    The repository name
                  </div>
                }
                bodyContent={
                  <div>
                    An valid github repository bane
                  </div>
                }
              >
                <button
                  type="button"
                  aria-label="More info for e-mail field"
                  onClick={e => e.preventDefault()}
                  aria-describedby="modal-with-form-form-email"
                  className="pf-c-form__group-label-help"
                >
                  <HelpIcon noVerticalAlign />
                </button>
              </Popover>
            }
            isRequired
            fieldId="modal-with-form-form-email">
              <TextInput
                isReadOnly={modalContext.isEditRepo.value}
                isRequired
                type="email"
                id="modal-with-form-form-email"
                name="modal-with-form-form-email"
                value={gitRepositoryValue}
                onChange={handleGitRepositoryInput}
              />
          </FormGroup>
          <FormGroup label="Team" isRequired isStack hasNoPaddingTop fieldId={''}>
            <TextInput
              isReadOnly={true}
              isRequired
              type="text"
              id="modal-with-form-form-team"
              name="modal-with-form-form-team"
              value={state.Team}
              />
          </FormGroup>
          <FormGroup label="Monitor CI Jobs" isRequired isStack hasNoPaddingTop fieldId={''}>
            <Checkbox label="Github Actions" id="alt-form-checkbox-1" name="alt-form-checkbox-1" value={String(monitorGithubActions)} onChange={handleGithubActionsMonitor} isChecked={Boolean(checked)}/>
          </FormGroup>
          <FormGroup label="Code Coverage" isRequired isStack hasNoPaddingTop fieldId={''}>
            <Checkbox label="codecov.io" id="alt-form-checkbox-2" name="alt-form-checkbox-2" />
          </FormGroup>
          <FormGroup 
            label="Quay.io Artifacts"
            labelIcon={
              <Popover
                headerContent={
                  <div>
                    Quay.io artifacts related to the repository
                  </div>
                }
                bodyContent={
                  <div>
                    If the repository contain more than one artifact add with coma separated:
                    quay.io/flacatus:repo1,quay.io/flacatus:repo2
                  </div>
                }
              >
                <button
                  type="button"
                  aria-label="More info for address field"
                  onClick={e => e.preventDefault()}
                  aria-describedby="modal-with-form-form-address"
                  className="pf-c-form__group-label-help"
                >
                  <HelpIcon noVerticalAlign />
                </button>
              </Popover>
            }
            isRequired
            fieldId="modal-with-form-form-address">
            <TextArea
              name="horizontal-form-exp"
              id="horizontal-form-exp"
            />
          </FormGroup>
         </Form>
        </Modal>
      </React.Fragment>
    );
};

